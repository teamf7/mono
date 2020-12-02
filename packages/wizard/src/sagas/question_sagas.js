import { call, put, select, takeEvery } from 'redux-saga/effects';

import { fetchJson, prepareQuestionJson, questionToRequest, prepareApprovalJson, resolveConditionArray } from '../util/util';
import { types } from '../actions';

import {
  currentTarget,
  getCurrentOg,
  getQuestions,
  getRedirectUrl,
  getQuestionGroup,
  getQuestionCommon,
  getDealsIp,
  getApproval,
  getPath,
  getStatus,
  getId,
  getBreadcrumb,
} from '../reselect';
import server from '../util/server';
import clone from 'clone';

// инициализация списка вопросов
function* fetchQuestionGroup({ payload }) {
  try {
    const target = yield select(currentTarget);
    const og = yield select(getCurrentOg);
    const path = yield select(getPath);
    const status = yield select(getStatus);
    const idProposal = yield select(getId);

    if (path === 'gid') {
      yield put({
        type: types.FETCH_GID_QUESTIONS,
      });
      return;
    }

    if (target.id === 'gid') {
      return;
    }

    const url = server + '/API/internal/v1/wizard_questions.php';
    let options;
    if (status === 'edit') {
      options = `${url}?proposalId=${idProposal}`;
    } else {
      options = `${url}?ogId=${og.id}&group=${target.id}`;
    }

    //const res = yield call(fetchJson, url, options);
    const res = yield call(fetchJson, options);
    yield put({
      type: 'FETCH_QUESTION_GROUP_SUCCEEDED',
      payload: { target: payload, value: prepareQuestionJson(res, og) },
    });

    if (res.redirectUrl) {
      yield put({
        type: types.SET_REDIRECT_URL,
        payload: res.redirectUrl,
      });
    }

    if (res.og) {
      yield put({
        type: types.FETCH_OG_LIST_SUCCEEDED,
        payload: { ogList: [res.og] },
      });
      yield put({
        type: types.SET_CURRENT_OG,
        payload: res.og.id,
      });
    }
  } catch (e) {
    yield put({ type: 'FETCH_QUESTION_GROUP_FAILED', message: e.message });
  }
}

function* pushQuestions({ redirectAfter }) {
  try {
    const breadcrumb = yield select(getBreadcrumb);
    const target = yield select(currentTarget);
    const questions = yield select(getQuestions);
    const og = yield select(getCurrentOg);
    const redirectUrl = yield select(getRedirectUrl);
    const body = { ...questionToRequest(questions, og), breadcrumb };
    const url = server + '/API/internal/v1/wizard_save.php';

    const params =
      process.env.NODE_ENV === 'development'
        ? {}
        : {
            method: 'post',
            headers: {
              'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            body: JSON.stringify({ body }),
          };
    const res = yield call(fetchJson, url, params);

    if (redirectAfter) {
      if(res?.ID){
        window.location = redirectUrl + res.ID + '/';
      } else {
        window.location = redirectUrl;
      }
      return;
    }

    let redirect = true;
    if (res.deals) {
      redirect = false;
      for (const deal of res.deals) {
        deal.sumNumber = parseFloat(deal.sum);
      }
      yield put({ type: types.SET_DEALS_LIST, payload: res.deals });
      yield put({ type: types.NEXT_STEP, payload: { type: 'deal_selection' } });
    }
    if (res.gid) {
      const paramValues = questions.ou.map((ou) => ou.paramValues).reduce((total, values) => Object.assign(total, values), {});
      yield put({
        type: types.SET_QUESTION_GROUP,
        payload: { data: prepareQuestionJson(res.gid, og, paramValues), id: 'gid' },
      });

      if (redirect) {
        redirect = false;
        yield put({ type: types.NEXT_STEP, payload: { type: 'question', id: 'gid' } });
      }
    }
    if (res.approvalList2) {
      yield put({
        type: types.SET_APPROVAL_LIST,
        payload: prepareApprovalJson(res),
      });

      if (redirect) {
        redirect = false;
        yield put({
          type: types.NEXT_STEP,
          payload: { type: 'approval', id: 'og', qid: target },
        });
      }
    }
    if (redirect) {
      window.location = redirectUrl;
    }
  } catch (e) {
    console.warn(e);
  }
}

const dealProps = ['id', 'sum', 'text', 'dealAsset'];
const dealSideProps = ['name', 'isOg'];

function* nextStepDealSelection() {
  const questionGroups = yield select(getQuestionGroup);
  if (questionGroups?.id) {
    const deals = yield select(getDealsIp);
    const dealParams = {};
    if (deals) {
      const { list, selected } = deals;
      const selectedDeals = list.filter((d) => selected.has(d.id));

      for (const [idx, deal] of selectedDeals.entries()) {
        for (const prop of dealProps) {
          dealParams[`deal.${idx + 1}.${prop}`] = {
            type: 'ref',
            source: 'wizardConstant_dealData',
            key: `${idx}.${prop}`,
          };
        }
        for (const [sidx, _] of deal.sides.entries()) {
          for (const prop of dealSideProps) {
            dealParams[`deal.${idx + 1}.side.${sidx + 1}.${prop}`] = {
              type: 'ref',
              source: 'wizardConstant_dealData',
              key: `${idx}.sides.${sidx}.${prop}`,
            };
          }
        }
      }

      yield put({
        type: types.SET_GID_QUESTION_DEAL_PARAMS,
        payload: {
          params: dealParams,
          values: {
            wizardConstant_dealData: selectedDeals,
          },
        },
      });
    }
    const filledGid = yield select(getQuestionGroup);
    let skipGid = true;
    outer: for (const el of filledGid.ou) {
      for (const q of el.questions) {
        if (!q.question.conditions || resolveConditionArray(q.question.conditions, filledGid.paramsList, el.paramValues)) {
          skipGid = false;
          break outer;
        }
      }
    }
    if (skipGid) {
      const previousGroup = yield select(getQuestionCommon);
      yield put({
        type: types.NEXT_STEP,
        payload: {
          type: 'approval',
          id: 'og',
          qid: previousGroup?.id,
        },
      });
    } else {
      yield put({
        type: types.NEXT_STEP,
        payload: {
          type: 'question',
          id: 'gid',
        },
      });
    }
  } else {
    const previousGroup = yield select(getQuestionCommon);
    // history.reverse().find(h => h.type === 'question_edit' && h.id !== 'gid').id;
    yield put({
      type: types.NEXT_STEP,
      payload: {
        type: 'approval',
        id: 'og',
        qid: previousGroup?.id,
      },
    });
  }
}

function* setApproval() {
  const target = yield select(currentTarget);
  const path = yield select(getPath);

  try {
    if (target.id === 'gid' && path === 'gid') {
      yield put({
        type: types.NEXT_STEP,
        payload: {
          type: 'approval',
          id: 'cauk',
        },
      });
    } else if (target.id === 'gid') {
      const previousGroup = null;
      yield put({
        type: types.NEXT_STEP,
        payload: {
          type: 'approval',
          id: 'og',
          qid: previousGroup,
        },
      });
    } else if (target.id === 'og') {
      yield put({
        type: types.NEXT_STEP,
        payload: {
          ...target,
          id: 'cauk',
        },
      });
    } else {
      yield put({
        type: types.PUSH_IP,
      });
    }
  } catch (e) {
    console.warn(e);
  }
}

function* pushIp() {
  try {
    const approval = yield select(getApproval);
    const gid = yield select(getQuestionGroup);
    const selectedDeals = yield select(getDealsIp);
    const redirectUrl = yield select(getRedirectUrl);
    const path = yield select(getPath);

    const approvalFinal = clone(approval);
    for (const approval of ['og', ['cauk']]) {
      for (const group of Object.values(approvalFinal[approval])) {
        for (const approver of group) {
          approver.question = Array.from(approver.question);
        }
      }
    }

    const body = {
      approval: approvalFinal,
      gid: gid ? questionToRequest(gid) : null,
      selectedDeals: path !== 'gid' && selectedDeals?.selected ? Array.from(selectedDeals.selected) : null,
    };

    const url = server + '/API/internal/v1/wizard_save.php?type=approval';
    const params = {
      method: 'post',
      body: JSON.stringify(body),
    };
    const res = yield call(fetchJson, url, params);
    if (redirectUrl && res.success && (res.ID || res.id)) {
      const redirectID = res.ID ? res.ID : res.id;
      window.location = redirectUrl + redirectID + '/';
    }
  } catch (e) {
    console.warn(e);
  }
}

function* fetchGidQuestions() {
  try {
    const og = yield select(getCurrentOg);
    const url = server + `/API/internal/v1/wizard_gid_question.php?ogId=${og.id}`;
    const res = yield call(fetchJson, url);

    const value = prepareQuestionJson(res, og);
    yield put({
      type: types.FETCH_QUESTION_GROUP_SUCCEEDED,
      payload: { target: { id: res.id }, value },
    });
    yield put({
      type: types.SET_APPROVAL_LIST,
      payload: prepareApprovalJson(res),
    });
  } catch (e) {
    console.warn(e);
  }
}
function* setCurrentOg({ payload }) {
  yield put({
    type: types.SET_CURRENT_OG,
    payload,
  });
  yield put({
    type: types.RESET_QUESTION_GROUPS,
  });
}

function* saveProposal() {
  try {
    const status = yield select(getStatus);
    if (status !== 'edit') {
      yield put({ type: types.PUSH_QUESTIONS, redirectAfter: true });
      return;
    }
    const breadcrumb = yield select(getBreadcrumb);
    const redirectUrl = yield select(getRedirectUrl);
    const approval = yield select(getApproval);
    const questionCommon = yield select(getQuestionCommon);
    const og = yield select(getCurrentOg);
    const idProposal = yield select(getId);

    const body = {
      ID: idProposal,
      approval,
      ...questionToRequest(questionCommon, og),
      og: og.id,
      breadcrumb,
    };

    const url = server + '/API/internal/v1/wizard_save.php';

    const params = {
      method: 'post',
      body: JSON.stringify(body),
    };
    const res = yield call(fetchJson, url, params);

    if (res.success && redirectUrl) {
      window.location = redirectUrl + res.ID + '/';
    }
  } catch (e) {
    yield put({ type: 'SAVE_PROPOSAL_FAILED', message: e.message });
  }
}

function* questionSaga() {
  yield takeEvery(types.FETCH_QUESTION_GROUP, fetchQuestionGroup);
  yield takeEvery(types.PUSH_QUESTIONS, pushQuestions);
  yield takeEvery(types.SET_NEXT_STEP_AFTER_DEAL_SELECTION, nextStepDealSelection);
  yield takeEvery(types.SET_APPROVAL, setApproval);
  yield takeEvery(types.PUSH_IP, pushIp);
  yield takeEvery(types.SET_OG, setCurrentOg);
  yield takeEvery(types.FETCH_GID_QUESTIONS, fetchGidQuestions);
  yield takeEvery(types.SAVE_PROPOSAL, saveProposal);
}

export default questionSaga;
