import { put, select, takeEvery, fork } from 'redux-saga/effects';
import { goBack } from 'react-router-redux';

import { types } from '../actions';
import questionSaga from './question_sagas';
import dealSaga from './deal_sagas';
import mainSaga from './main_sagas';
import directiveSaga from './directive_sagas';
import nominationSagas from './nomination_sagas';
import { getRedirectUrl, currentTarget } from '../reselect';
import server from '../util/server';

/**
 * Sagas - это библиотека нацеленная делать сайд-эффекты проще и лучше путем работы с сагами.
 * Существует 3 sagas^
 * - deal_sagas для сделок
 * - main_sagas для навигации вперед и назад
 * - question_sagas для вопросов
 */

function* nextStep({ payload }) {
  // След шаг
  try {
    const state = yield select();
    const validation = payload?.validation && payload?.validation(state);

    if (validation?.isValid === false) {
      alert(validation?.text);
      return;
    }
    const isNext = payload.isNext && payload?.isNext(state);
    if (payload.isButton) {
      yield put({ type: types.ADD_BREADCUMB, payload: { id: payload.id, text: payload.text } });
    }

    if (payload.nextButton && state.future.length > 0) {
      yield put({ type: types.REDO });
    } else if (isNext?.success) {
      yield put({ type: isNext.type, payload: isNext.payload });
      return;
    } else if (payload.isFunc) {
      // Если isFunc === true, то следовательно должна быть функция func
      const newPayload = payload.func(state, true);
      if (newPayload) {
        yield put({ type: types.NEXT_STEP_SUCCEEDED, payload: newPayload });
      }
    } else {
      yield put({ type: types.NEXT_STEP_SUCCEEDED, payload });
    }
  } catch (e) {
    console.error(e);
  }
}

function* prevStep({ payload }) {
  // Пред шаг
  try {
    const state = yield select();
    const target = yield select(currentTarget);

    if (target.isButton) {
      yield put({ type: types.POP_BREADCUMB });
    }

    if (!state.past.length) {
      const redirectUrl = yield select(getRedirectUrl);
      if (redirectUrl === null) {
        yield put({
          payload: {
            args: [],
            method: 'back',
          },
          type: '@@router/CALL_HISTORY_METHOD',
        });
      } else {
        window.location = redirectUrl;
      }
      return;
    }
    if (payload.isPrev && payload?.isPrev(state)) {
      // Если newPayload undo
      yield put({ type: types.UNDO });
      return;
    }
    if (payload.isFunc) {
      // Если isFunc === true, то следовательно должна быть функция cb
      const newPayload = payload.func(state);
      yield put({ type: types.PREV_STEP_SUCCEEDED, payload: newPayload });
    } else {
      yield put({ type: types.UNDO });
    }
  } catch (e) {
    console.error(e);
  }
}

function* initialization({ payload }) {
  try {
    switch (payload.type) {
      case 'gid':
        yield put({
          type: types.FETCH_OG_LIST,
        });
        yield put({
          type: types.INIT,
          payload: {
            type: 'settings_gid',
            id: 'gid',
            path: payload.type || 'gid',
          },
        });
        break;
      case 'deal':
        if (payload.status === 'edit') {
          yield put({
            type: types.EDIT,
            payload: {
              ...payload,
              path: payload.type,
            },
          });
          yield put({
            type: types.DEAL_EDIT,
            payload,
          });
        } else {
          yield put({
            type: types.INIT,
            payload: { type: 'deal_start', path: payload.type },
          });
        }

        break;
      case 'directive':
        yield put({
          type: types.FETCH_KM_LIST,
        });
        if (payload.status === 'edit') {
          yield put({
            type: types.SET_REDIRECT_URL,
            payload: server + '/og/directive/' + payload.id + '/',
          });
          yield put({
            type: types.EDIT,
            payload: { ...payload, path: payload.type, type: 'km_select' },
          });
        } else {
          yield put({
            type: types.SET_REDIRECT_URL,
            payload: server + '/og/directive/',
          });
          yield put({
            type: types.INIT,
            payload: { type: 'km_select' },
          });
        }
        break;
      case 'base':
      case 'proposal':
        if (payload.status === 'edit') {
          yield put({
            type: types.EDIT,
            payload: { ...payload, path: payload.type, type: 'question' },
          });
        } else {
          yield put({
            type: types.FETCH_OG_LIST,
          });
          yield put({
            type: types.INIT,
            payload: { type: 'settings', path: payload.type },
          });
        }
        break;
      case 'nomination':
        yield put({
          type: types.FETCH_NOMINATION_OPTIONS,
          payload,
        });
        if (payload.status === 'edit') {
          yield put({
            type: types.EDIT,
            payload,
          });
        } else {
          yield put({
            type: types.INIT,
            payload: { type: 'nomination' },
          });
        }
        break;
    }
  } catch (e) {
    console.error(e);
  }
}

function* exit() {
  if (window.confirm('Изменения не будут сохранены, желаете продолжить?')) {
    const redirectUrl = yield select(getRedirectUrl);
    window.location = redirectUrl;
  }
}

function* rootSaga() {
  yield takeEvery(types.NEXT_STEP, nextStep);
  yield takeEvery(types.PREV_STEP, prevStep);
  yield takeEvery(types.INITIALIZATION, initialization);
  yield takeEvery(types.EXIT, exit);
  yield fork(mainSaga);
  yield fork(dealSaga);
  yield fork(questionSaga);
  yield fork(directiveSaga);
  yield fork(nominationSagas);
}

export default rootSaga;
