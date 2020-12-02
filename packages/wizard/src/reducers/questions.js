import produce from 'immer';

import { types as actionTypes, types } from '../actions';
import { reindexFiles } from '../util/util';
/**
 * Редюсер для вопросов,
 * хранит список форм и ОГ
 */
export const initialState = {
  general: null, // основная форма вопросов
  gid: null, // гид форма
  deals: {
    list: null,
    selected: new Set(),
    search: {
      id: '',
      minSum: '',
      maxSum: '',
      sides: [
        { name: '', isOg: true },
        { name: '', isOg: true },
      ],
      sortBy: 'id',
    },
  },
  approvalList: null,
};

export default produce((draft, { type, payload }) => {
  switch (type) {
    case actionTypes.FETCH_QUESTION_GROUP_SUCCEEDED: {
      const id = payload.target?.id === 'gid' ? 'gid' : 'general';

      if (draft[id]?.id === payload.value.id) {
        return draft;
      }
      draft[id] = payload.value;
      return draft;
    }
    case actionTypes.RESET_QUESTION_GROUPS: {
      draft.gid = null;
      draft.general = null;
      return draft;
    }
    case actionTypes.REORDER_QUESTION: {
      const id = payload.target.id === 'gid' ? 'gid' : 'general';
      const current = draft[id];

      const currentOuIndex = current.ou.findIndex((e) => e.id === payload.uiId);
      const currentQuestionIndex = current.ou[currentOuIndex].questions.findIndex((q) => q.question.id === payload.questionId);
      const endIndex = payload.up ? currentQuestionIndex - 1 : currentQuestionIndex + 1;

      const result = current.ou[currentOuIndex].questions;

      const [removed] = result.splice(currentQuestionIndex, 1);

      result.splice(endIndex, 0, removed);
      return draft;
    }
    case actionTypes.SELECT_QUESTION: {
      const id = payload.target.id === 'gid' ? 'gid' : 'general';
      const current = draft[id];

      const currentOuIndex = current.ou.findIndex((e) => e.id === payload.uiId);
      const currentQuestionIndex = current.ou[currentOuIndex].questions.findIndex((q) => q.question.id === payload.questionId);
      const question = current.ou[currentOuIndex].questions[currentQuestionIndex];

      // если добавляем не alone
      if (question.selected) {
        question.selected = false;
        question.position = 'hidden';
        question.parentId = '';
      } else {
        question.selected = true;
        question.position = 'alone';
        question.parentId = '';
      }
      current.ou[currentOuIndex].questions[currentQuestionIndex] = { ...question };
      current.paramsList = reindexFiles(current);
      return draft;
    }
    case actionTypes.VOTE_UPDATE: {
      const id = payload.target.id === 'gid' ? 'gid' : 'general';
      const current = draft[id];

      const ouIdx = current.ou.findIndex((o) => o.id === payload.target.ou);
      const mainQuestions = current.ou[ouIdx].questions.filter((q) => q.selected).map((q) => q.question);

      mainQuestions[payload.target.step].voteResult =
        mainQuestions[payload.target.step].voteResult === payload.v ? '' : payload.v;
      return draft;
    }
    case actionTypes.CHANGE_QUESTION_PARAM_VALUES: {
      const id = payload.id === 'gid' ? 'gid' : 'general';
      const current = draft[id];

      current.ou[payload.idx].paramValues[payload.target.name] = payload.target.value;
      return draft;
    }
    case actionTypes.TOGGLE_LINKED: {
      const id = payload.target.id === 'gid' ? 'gid' : 'general';
      const current = draft[id];

      const linked = current.ou
        .find((o) => o.id === payload.ouId)
        .questions.find((q) => q.question.id === payload.linkedQuestionId);

      if (linked.position === 'linked') {
        if (linked.parentId === payload.mainQuestionId) {
          linked.position = 'hidden';
          linked.parentId = null;
        } else {
          linked.parentId = payload.mainQuestionId;
        }
      } else {
        linked.position = 'linked';
        linked.parentId = payload.mainQuestionId;
      }
      current.paramsList = reindexFiles(current);
      return draft;
    }
    case types.SET_DEALS_LIST: {
      draft.deals.list = payload;
      return draft;
    }
    case types.SET_DEAL_SELECTION_SEARCH: {
      draft.deals.search = payload;
      return draft;
    }
    case types.SET_QUESTION_GROUP: {
      draft[payload.id] = payload.data;
      return draft;
    }

    case actionTypes.SET_GID_QUESTION_DEAL_PARAMS: {
      // очистка всех прошлых deal.*
      draft.gid.paramsList = Object.entries(draft.gid.paramsList)
        .filter(([key]) => !/^deal.\d+/.test(key))
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});
      const { params, values } = payload;
      Object.assign(draft.gid.paramsList, params);
      for (const ou of draft.gid.ou) {
        Object.assign(ou.paramValues, values);
      }
      return draft;
    }
    case types.SET_DEALS_SELECTED: {
      if (!payload.checked) {
        draft.deals.selected.delete(payload.value);
      } else {
        draft.deals.selected.add(payload.value);
      }
      return draft;
    }
    case types.SET_APPROVAL_LIST: {
      draft.approvalList = payload;
      return draft;
    }
    case types.CHANGE_APPROVER: {
      draft.approvalList[payload.target.id].additional.push(payload.value);
      return draft;
    }
    case types.TOGGLE_APPROVER_QUESTION: {
      const additional = draft.approvalList[payload.target.id].additional;
      const question = additional.find((el) => el.id === payload.approverId).question;
      if (question.has(payload.questionId)) {
        question.delete(payload.questionId);
      } else {
        question.add(payload.questionId);
      }
      return draft;
    }
    case types.SET_SELECTED_GROUP_APPROVER: {
      const list = draft.approvalList[payload.target.id];
      const current = list[payload.group];
      current[payload.index].selected = true;
      return draft;
    }
    case types.SET_UNSELECTED_GROUP_APPROVER: {
      const list = draft.approvalList[payload.target.id];
      const current = list[payload.group];

      if (payload.group !== 'additional') {
        current[payload.index].selected = false;
      } else {
        current.splice(payload.index, 1);
      }
      return draft;
    }
    default:
      return draft;
  }
}, initialState);
