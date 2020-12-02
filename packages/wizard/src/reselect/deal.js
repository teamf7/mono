import { createSelector } from 'reselect';
import { mainSelector } from './main_reselect';

// Обычная функция извлекающая нужный срез данных из состояния
const dealFormsSelector = (state) => {
  return state.edit.deal.forms;
};

// селектор на основе функции, позволяет за
const currentDealFormInfo = createSelector([dealFormsSelector, mainSelector], (dealFormsSelector, mainSelector) => {
  return dealFormsSelector.find((form) => {
    return mainSelector.currentForm.id ? form.id === mainSelector.currentForm.id : !form.parentFormId;
  });
});

const getDealTypical = (state) => state.edit.deal.typical;
const getDealContractType = (state) => state.edit.deal.contractType;
const getDealActivityField = (state) => state.edit.deal.activityField;
const getDealVersionType = (state) => state.edit.deal.versionType;
const getDealSubjectBasic = (state) => state.edit.deal.subjectBasic;
const getDealJustification = (state) => state.edit.deal.justification;
const dealSidesSelector = (state) => state.edit.deal.sides;
const dealRolesSelector = (state) => state.edit.deal.roles;
const dealRolesBySideSelector = (state) => state.edit.deal.rolesBySide;
const dealSubjectSelector = (state) => state.edit.deal.subject;
const dealTargetSelector = (state) => state.edit.deal.target;

const currentSideNum = createSelector([mainSelector], (mainSelector) => mainSelector.currentForm.id);

const dealSumTypeSelector = createSelector([dealSidesSelector], (sides) => {
  if (sides[0]?.role === 'agent' && sides[1]?.role === 'printsipal') {
    return {
      type: 'agent',
      sumName: 'Общий размер вознаграждения может составить',
      sumLabel: 'Размер вознаграждения',
    };
  }
  if (sides[0]?.role === 'prodavets' && !sides[1]) {
    return {
      type: 'vendor',
      sumName: 'Начальная цена продажи',
      sumLabel: 'Начальная цена продажи',
      minSumName: 'Минимальная цена продажи',
      sumTypes: [1, 2],
    };
  }
  return {
    type: 'default',
    sumName: 'Общая сумма сделки может составлять',
    sumLabel: 'Сумма сделки',
  };
});

const dealCurrenciesSelector = (state) => state.edit.deal.currencies;
const dealVatsSelector = (state) => state.edit.deal.vats;
const dealSumSelector = (state) => state.edit.deal.sum;
//const dealRedirectUrlSelector = (state) => state.edit.deal.redirectUrlSelector;
const dealRedirectUrlSelector = (state) => state.edit.deal.redirectUrl;

const availableRolesSelector = createSelector(
  [dealSidesSelector, dealRolesSelector, dealRolesBySideSelector, getDealTypical],
  (sides, roles, rolesBySide, typical) => {
    const availableRoles = [];
    if (typical) {
      for (const [side, sideRoles] of rolesBySide.entries()) {
        if (side === 0) {
          availableRoles[side] = sideRoles;
          continue;
        }
        const previousRole = sides[side - 1]?.role;
        const opposition = roles[previousRole]?.opposition;

        if (!opposition?.length) {
          availableRoles[side] = sideRoles;
        } else {
          availableRoles[side] = sideRoles.filter((role) => opposition.includes(role));
        }
      }
      return availableRoles.map((side) => side.map((role) => roles[role]));
    } else {
      const allRoles = Object.values(roles);
      for (let i = 0; i < sides.length; i++) {
        availableRoles[i] = allRoles;
      }
      return availableRoles;
    }
  }
);

const getDealId = (state) => state.present.main.idProposal;

export {
  dealFormsSelector,
  currentDealFormInfo,
  dealSidesSelector,
  currentSideNum,
  dealRolesSelector,
  dealRolesBySideSelector,
  availableRolesSelector,
  dealCurrenciesSelector,
  dealVatsSelector,
  dealSumSelector,
  dealSumTypeSelector,
  dealSubjectSelector,
  dealTargetSelector,
  dealRedirectUrlSelector,
  getDealId,
  getDealTypical,
  getDealActivityField,
  getDealContractType,
  getDealVersionType,
  getDealSubjectBasic,
  getDealJustification
};
