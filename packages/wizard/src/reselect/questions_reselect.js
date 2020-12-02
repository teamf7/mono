import { createSelector } from 'reselect';
import { currentTarget, getPath } from './main_reselect';
import { el } from 'date-fns/locale';
import { getSelectedIp } from './directive';
import { resolveConditionArray } from '../util/util';

const getQuestionSelector = (state) => {
  return state.edit.questions;
};

const getQuestions = createSelector([getQuestionSelector, currentTarget, getPath], (questions, target, path) => {
  if (path === 'gid') {
    return questions['gid'];
  }
  const id = target.id === 'gid' ? 'gid' : 'general';

  return questions[id];
});

const getApprovalQuestions = createSelector(
  [getQuestionSelector, currentTarget, getPath, getSelectedIp],
  (questions, target, path, directiveIps) => {
    let qGroup;
    if (path === 'gid') {
      qGroup = questions['gid'];
    } else {
      qGroup = questions[target.id === 'gid' ? 'gid' : 'general'];
    }

    return qGroup;
  }
);

const getOuList = createSelector([getQuestions], (questions) => questions.ou);

const valSort = (val) => (a, b) => a[val] - b[val];
const sideSort = (side) => (a, b) => {
  const aName = a.sides[side]?.name;
  const bName = b.sides[side]?.name;
  return aName > bName ? 1 : bName > aName ? -1 : 0;
};

const getDealsIp = (state) => state.edit.questions.deals;
const getDealsIpSearch = createSelector([getDealsIp], (deals) => deals.search);
const getDealsIpList = createSelector([getDealsIp], (deals) => deals.list);
const getDealsIpSelected = createSelector([getDealsIp], (deals) => deals.selected);
const getDealsIpSort = createSelector([getDealsIpSearch], ({ sortBy }) => {
  if (sortBy.includes('side')) {
    return sideSort(sortBy.split('.')[1]);
  } else {
    return valSort(sortBy);
  }
});
const getFilteredDealsIp = createSelector(
  [getDealsIpSort, getDealsIpSearch, getDealsIpSelected, getDealsIpList],
  (sort, search, selected, list) => {
    const filtered = [];
    filtering: for (const deal of list) {
      if (search.id && deal.id !== parseInt(search.id)) {
        continue;
      }
      if (search.minSum && deal.sumNumber < parseFloat(search.minSum)) {
        continue;
      }
      if (search.maxSum && deal.sumNumber > parseFloat(search.maxSum)) {
        continue;
      }
      for (const [side, sidefilter] of search.sides.entries()) {
        if (deal.sides[side]?.isOg !== sidefilter.isOg) {
          continue filtering;
        }
        if (sidefilter.name && !deal.sides[side].name?.includes(sidefilter.name)) {
          continue filtering;
        }
      }
      filtered.push({ ...deal, selected: selected.has(deal.id) });
    }
    return filtered.sort(sort);
  }
);

const getQuestionGroup = (state) => state.edit.questions.gid;

const getQuestionCommon = (state) => state.edit.questions.general;

const getCurrentOu = createSelector([getQuestions, currentTarget], (questions, target) => {
  const ou = questions.ou.find((o) => o.id === target.ou);
  return {
    ...ou,
    questions: ou.questions.filter((q) => {
      if (!q.question.conditions) {
        return true;
      }
      return resolveConditionArray(q.question.conditions, questions.paramsList, ou.paramValues);
    }),
  };
});

const getMainQuestions = createSelector([getCurrentOu], (ou) => ou.questions.filter((q) => q.selected).map((q) => q.question));

const getAllQuestions = createSelector([getOuList], (list) => {
  return list.reduce((res, ou) => {
    return res.concat(ou.questions.filter((q) => q.selected).map((q) => q.question));
  }, []);
});

const linkedQuestions = createSelector([getCurrentOu, currentTarget, getMainQuestions], (ou, target, mainQuestions) =>
  ou.questions.filter((q) => q.position === 'linked' && q.parentId === mainQuestions[target.step].id).map((q) => q.question)
);

const hiddenQuestions = createSelector(getCurrentOu, (ou) =>
  ou.questions.filter((q) => q.position !== 'linked' && !q.selected).map((q) => q.question)
);

const getApproval = (state) => state.edit.questions.approvalList;

const getApprovalList = createSelector([getQuestionSelector, currentTarget], (questions, target) => {
  return questions.approvalList[target.id] || {};
});

const getApprovalHint = createSelector([getQuestionSelector, currentTarget], (questions, target) => {
  return questions.approvalList.hints[target.id];
});

export {
  getQuestionSelector,
  getQuestions,
  getCurrentOu,
  getDealsIp,
  getQuestionGroup,
  getMainQuestions,
  linkedQuestions,
  hiddenQuestions,
  getOuList,
  getApprovalList,
  getApproval,
  getApprovalQuestions,
  getQuestionCommon,
  getApprovalHint,
  getAllQuestions,
  getFilteredDealsIp,
  getDealsIpSearch,
};
