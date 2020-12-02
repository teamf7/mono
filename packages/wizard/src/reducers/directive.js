import produce from 'immer';

import { types as actionTypes } from '../actions';

export const initialState = {
  kms: [],
  selectedKm: null,
  ips: [],
  ratifiers: [],
  approvers: [],
};

export default produce((draft, { type, payload }) => {
  switch (type) {
    case actionTypes.SET_KM_LIST: {
      draft.kms = payload.kms;
      if (payload.km) {
        draft.selectedKm = draft.kms.find((km) => km.id === payload.km);
      } else {
        draft.selectedKm = payload[0];
      }
      return draft;
    }
    case actionTypes.SET_KM: {
      draft.selectedKm = draft.kms.find((km) => km.id === payload.id);
      return draft;
    }
    case actionTypes.SET_IP_LIST: {
      const { list } = payload;
      draft.ips = list.map((o) => ({
        ...o,
        nameLower: o.name.toLowerCase(),
        ogLower: o.og.toLowerCase(),
        routeLower: o.route.toLowerCase(),
        executorLower: o.executor.toLowerCase(),
        compOgLower: o.compOg.join('').toLowerCase(),
        compRnLower: o.compRn.join('').toLowerCase(),
        selected: o.hasOwnProperty('selected') ? o.selected : false,
        questions: o.questions.map((q) => ({
          ...q,
          selected: q.hasOwnProperty('selected') ? q.selected : true,
          voteOverride: q.hasOwnProperty('voteOverride') ? q.voteOverride : false,
        })),
      }));
      return draft;
    }
    case actionTypes.TOGGLE_IP: {
      const ip = draft.ips.find((i) => i.id === payload);
      ip.selected = !ip.selected;
      return draft;
    }

    case actionTypes.TOGGLE_IP_QUESTION: {
      const ip = draft.ips.find((i) => i.id === payload.ip);
      const question = ip.questions.find((q) => q.id === payload.question);
      question.selected = !question.selected;
      return draft;
    }

    case actionTypes.SET_IP_QUESTION_VOTE_OVERRIDE: {
      const ip = draft.ips.find((i) => i.id === payload.ip);
      const question = ip.questions.find((q) => q.id === payload.question);
      question.voteOverride = payload.vote;
      return draft;
    }
    case actionTypes.TOGGLE_DIRECTIVE_QUESTION: {
      const { option, question } = payload;
      draft.options[option].questions[question].selected = !draft.options[option].questions[question].selected;
      return draft;
    }
    case actionTypes.INIT_DIRECTIVE_APPROVAL: {
      const { approvers, ratifiers } = payload;
      draft.approvers = approvers;
      draft.ratifiers = ratifiers;
      return draft;
    }
    case actionTypes.ADD_DIRECTIVE_APPROVER: {
      draft.approvers.push(payload);
      return draft;
    }
    case actionTypes.REMOVE_DIRECTIVE_APPROVER: {
      draft.approvers.splice(payload, 1);
      return draft;
    }
    default:
      return draft;
  }
}, initialState);
