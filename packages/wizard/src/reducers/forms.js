import produce from 'immer';

import { types as actionTypes } from '../actions';

/**
 * Редюсер для формы,
 * хранит список форм и ОГ
 */
export const initialState = {
  forms: [],
  og: {},
  ogList: null,
  breadcrumb: [],
};

export default produce((draft, { type, payload }) => {
  switch (type) {
    case actionTypes.SET_CURRENT_OG:
      draft.og = payload;
      draft.forms = [];
      return draft;
    case actionTypes.FETCH_OG_LIST_SUCCEEDED:
      draft.ogList = payload.ogList;
      draft.og = payload.ogList[0];
      return draft;
    case actionTypes.FETCH_FORMS_SUCCEEDED: {
      draft.forms = payload;
      return draft;
    }
    case actionTypes.ADD_BREADCUMB: {
      draft.breadcrumb.push(payload);
      return draft;
    }
    case actionTypes.POP_BREADCUMB: {
      draft.breadcrumb.pop();
      return draft;
    }
    default:
      return draft;
  }
}, initialState);
