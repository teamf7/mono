import { createSelector } from 'reselect';
import { currentTarget } from '.';

const getKmList = (state) => {
  return state.edit.directive.kms;
};

const getKm = (state) => {
  return state.edit.directive.selectedKm;
};
const getIpList = (state) => {
  return state.edit.directive.ips;
};

const getDirectiveApprovers = (state) => {
  return state.edit.directive.approvers;
};

const getDirectiveRatifiers = (state) => {
  return state.edit.directive.ratifiers;
};

const getSelectedIp = createSelector([getIpList], (ips) => ips.filter((ip) => ip.selected));

const getCurrentSelectedIp = createSelector([getSelectedIp, currentTarget], (ips, target) => {
  if (target.type !== 'directive_question_select' || target.summary) {
    return ips;
  }
  return [ips[target.idx || 0]];
});

const getIpNav = createSelector([getIpList, currentTarget], (ips, target) => {
  if (target.summary) {
    return null;
  }
  const allSelected = ips
    .filter((ip) => ip.selected)
    .map((ip, idx) => ({
      type: 'directive_question_select',
      name: ip.name,
      isEditable: true,
      idx,
      currentStep: target.idx,
    }));
  allSelected[allSelected.length - 1].last = true;
  return allSelected;
});

export {
  getKmList,
  getKm,
  getIpList,
  getCurrentSelectedIp,
  getIpNav,
  getSelectedIp,
  getDirectiveApprovers,
  getDirectiveRatifiers,
};
