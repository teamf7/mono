function createDealSide() {
  return {
    og: true,
    sideId: '',
    sideName: '',
    role: '',
    roleName: '',
    bsa: 0,
    bsaDate: new Date(),
    anotherSide: false,
  };
}

export const SET_FORMS = 1;
export const SET_QUESTION_GROUP = 2;
export const SET_CURRENT_OG = 3;
export const SET_OG_LIST = 4;
export const SET_DEAL_SUBJECT = 5;
export const SET_DEAL_SUM = 6;
export const SET_DEAL_SIDE = 7;
export const ADD_DEAL_SIDE = 8;
export const SETUP_IP = 9;
export const SETUP_DEAL = 10;
export const SET_APPROVAL_LIST = 11;
export const SET_DEALS_LIST = 12;
export const SET_DEALS_SELECTED = 13;

export default function reducer(state, action) {
  switch (action.type) {
    case SET_FORMS:
      return { ...state, forms: action.data };
    case SET_QUESTION_GROUP:
      return {
        ...state,
        questionGroups: {
          ...state.questionGroups,
          [action.id]: action.data,
        },
      };
    case SET_CURRENT_OG:
      return { ...state, og: state.ogList.find((og) => og.id === action.data), forms: [] };
    case SET_OG_LIST:
      return { ...state, ogList: action.data };
    case SET_DEAL_SUBJECT:
      return {
        ...state,
        dealSubjects: {
          ...state.dealSubjects,
          [action.id]: action.data,
        },
      };
    case SET_DEAL_SUM:
      return { ...state, dealSum: action.data, isAgent: !!action.data.reward };
    case ADD_DEAL_SIDE:
      return { ...state, dealSides: [...state.dealSides, createDealSide()] };
    case SET_DEAL_SIDE:
      const sides = state.dealSides.slice();
      sides[action.id] = action.data;
      const newState = { ...state, dealSides: sides };
      if (state.dealSides[action.id] && state.dealSides[action.id].role !== action.data.role) {
        newState.forms = [];
        newState.dealSubjects = {};
      }
      return newState;
    case SETUP_IP:
      return {
        ...state,
        init: true,
        og: action.data.ogList[0],
        ogList: action.data.ogList,
        redirectUrl: action.data.redirectUrl,
      };
    case SETUP_DEAL:
      return {
        ...state,
        init: true,
        redirectUrl: action.data.redirectUrl,
        dealSum: {
          ...state.dealSum,
          ...action.data,
          currency: action.data.currencies[0].code,
          vatIncluded: action.data.vats[0].code,
        },
      };
    case SET_APPROVAL_LIST:
      return { ...state, approvalList: action.data };
    case SET_DEALS_LIST:
      return { ...state, deals: { ...state.deals, list: action.data } };
    case SET_DEALS_SELECTED:
      return { ...state, deals: { ...state.deals, selected: action.data } };
  }
}

export const initialState = {
  init: false,
  forms: [],
  questionGroups: {},
  og: {},
  dealSubjects: {},
  dealSum: {
    sum: '0',
    currency: '',
    currencies: [],
    vatIncluded: '',
    vats: [],
    vat: '0',
    obligations: '0',
    reward: '',
    rateDate: new Date(),
    rates: {},
    noRate: false,
  },
  approvalList: {
    og: [],
    cauk: [],
  },
  dealSides: [createDealSide(), createDealSide()],
  isAgent: false,
  deals: {
    list: [],
    selected: [],
  },
};
