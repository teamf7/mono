import produce from 'immer';

import { types as actionTypes } from '../actions';

/**
 * Общий редюсер (необходимо разделить на мелкие редьюсеры)
 * Должен хранить логику текущего состояния
 * currentForm => {
 *  type: тип формы
 *  id: идентификатор для отображения нужной формы
 *  step: шаг для форм с собственной логикой маршрутизации (пока не реализован)
 * }
 */
export const initialState = {
  init: false,
  currentForm: {},
  redirectUrl: null,
  path: '',
  status: 'init',
  id: null,
};

export default produce((draft, { type, payload }) => {
  switch (type) {
    case actionTypes.INIT: {
      draft.currentForm.type = payload.type;
      draft.currentForm.id = payload.id;
      draft.path = payload.path || '';
      return draft;
    }
    case actionTypes.EDIT: {
      draft.currentForm.type = payload.type;
      draft.id = payload.id;
      draft.status = payload.status;
      draft.path = payload.path || '';
      return draft;
    }
    case actionTypes.SET_REDIRECT_URL: {
      draft.redirectUrl = payload;
      return draft;
    }
    case actionTypes.NEXT_STEP_SUCCEEDED: {
      if (payload) {
        draft.currentForm = payload;
      }
      return draft;
    }
    case actionTypes.PREV_STEP_SUCCEEDED: {
      draft.currentForm = payload;
      return draft;
    }
    default:
      return draft;
  }
}, initialState);
