import { call, put, select, takeEvery } from 'redux-saga/effects';

import { fetchJson } from '../util/util';
import server from '../util/server';
import { types } from '../actions';
import {
  getKm,
  getApprovalList,
  getSelectedIp,
  getDirectiveApprovers,
  getDirectiveRatifiers,
  getId,
  getStatus,
  getIpList,
} from '../reselect';

function* fetchKmList(payload) {
  let url = server + '/API/internal/v1/wizard_directive.php';
  if (payload.status === 'edit') {
    url += '?directive=' + payload.id;
  }
  const res = yield call(fetchJson, url);
  yield put({ type: types.SET_KM_LIST, payload: res });
}

function* nextAfterKmSelect() {
  const status = yield select(getStatus);
  const isEdit = status === 'edit';

  const ips = yield select(getIpList);
  if (!ips.length) {
    const km = yield select(getKm);

    let url = server + '/API/internal/v1/wizard_directive_ip.php?km=' + km.id;

    if (isEdit) {
      const id = yield select(getId);
      url += '&directive=' + id;
    }
    const list = yield call(fetchJson, url);

    yield put({
      type: types.SET_IP_LIST,
      payload: { list },
    });
  }

  if (isEdit) {
    const selected = yield select(getSelectedIp);

    yield put({
      type: types.NEXT_STEP,
      payload: {
        type: 'directive_question_select',
        idx: 0,
        last: 1 === selected.length,
      },
    });
  } else {
    yield put({
      type: types.NEXT_STEP,
      payload: {
        type: 'ip_select',
      },
    });
  }
}

function* goToDirectiveApproval() {
  const status = yield select(getStatus);
  const isEdit = status === 'edit';
  const ips = yield select(getSelectedIp);
  let url = server + '/API/internal/v1/wizard_directive_approval.php?';
  if (isEdit) {
    const id = yield select(getId);
    url += 'directive=' + id;
  } else {
    url += 'ips=' + ips.map((ip) => ip.id).join(',');
  }
  const data = yield call(fetchJson, url);

  yield put({
    type: types.INIT_DIRECTIVE_APPROVAL,
    payload: data,
  });
  yield put({
    type: types.NEXT_STEP,
    payload: {
      type: 'directive_approval',
    },
  });
}
function* saveDirective() {
  const id = yield select(getId);
  const ips = yield select(getSelectedIp);
  const km = yield select(getKm);
  const approvers = yield select(getDirectiveApprovers);
  const ratifiers = yield select(getDirectiveRatifiers);

  const body = {};
  if (id) {
    body.id = id;
  }
  if (km) {
    body.km = km.id;
  }
  if (ips.length) {
    body.ips = ips.map((ip) => ({
      id: ip.id,
      questions: ip.questions.filter((q) => q.selected).map((q) => ({ id: q.id, voteOverride: q.voteOverride })),
    }));
  }
  if (approvers.length) {
    body.approvers = approvers.map((a) => a.id);
    body.ratifiers = ratifiers.map((r) => r.id);
  }

  const result = yield call(fetchJson, server + '/API/internal/v1/wizard_save.php?type=directive', {
    method: 'post',
    body: JSON.stringify(body),
  });

  if (result?.ID) {
    window.location = server + '/og/directive/' + result.ID + '/';
  }
}

export default function* directiveSaga() {
  yield takeEvery(types.FETCH_KM_LIST, fetchKmList);
  yield takeEvery(types.NEXT_AFTER_KM_SELECT, nextAfterKmSelect);
  yield takeEvery(types.GO_TO_DIRECTIVE_APPROVAL, goToDirectiveApproval);
  yield takeEvery(types.SAVE_DIRECTIVE, saveDirective);
}
