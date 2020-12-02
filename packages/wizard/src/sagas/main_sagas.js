import { call, put, select, takeEvery } from 'redux-saga/effects';

import { fetchJson, questionToRequest } from '../util/util';

import { types } from '../actions';

import {
  getCurrentOg,
  getRedirectUrl,
  getApproval,
  getQuestionCommon,
  getId,
  getPath,
  getBreadcrumb,
  getStatus,
} from '../reselect';
import server from '../util/server';

// инициализация списка форм
function* fetchForms({ payload }) {
  try {
    const isDeal = payload === 'deal';
    let url = server + '/API/internal/v1/wizard_forms.php?';

    if (isDeal) {
      url += 'type=DEAL';
    } else {
      const og = yield select(getCurrentOg);
      url += `ogId=${og.id}`;
    }

    const res = yield call(fetchJson, url);
    yield put({ type: types.FETCH_FORMS_SUCCEEDED, payload: res });
  } catch (e) {
    yield put({ type: types.FETCH_FORMS_FAILED, message: e.message });
  }
}

function* fetchQgList() {
  // инициализация списка общества групп
  try {
    const url = server + '/API/internal/v1/wizard_settings.php';

    const res = yield call(fetchJson, url);
    if (res.ogList) {
      yield put({
        type: types.FETCH_OG_LIST_SUCCEEDED,
        payload: res,
      });
    }
    yield put({
      type: types.SET_REDIRECT_URL,
      payload: res.redirectUrl,
    });
  } catch (e) {
    yield put({ type: types.FETCH_OG_LIST_FAILED, message: e.message });
  }
}

function* save() {
  const path = yield select(getPath);
  switch (path) {
    case 'proposal': {
      yield put({ type: types.SAVE_PROPOSAL });
      break;
    }
    case 'directive': {
      yield put({ type: types.SAVE_DIRECTIVE });
      break;
    }
  }
}

function* mainSaga() {
  yield takeEvery(types.FETCH_OG_LIST, fetchQgList);
  yield takeEvery(types.FETCH_FORMS, fetchForms);
  yield takeEvery(types.SAVE, save);
}

export default mainSaga;
