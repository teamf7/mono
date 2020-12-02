import { createSelector } from 'reselect';
import { pages } from '../components/forms';
import { types } from '../actions';

const getPresentSelector = (state) => state.present;

const mainSelector = (state) => {
  return state.present.main;
};

const getFuture = (state) => state.future;

const getPast = (state) => state.past;

const currentTarget = (state) => {
  return state.present.main.currentForm;
};

const getStatus = (state) => state.present.main.status;

const getId = (state) => state.present.main.id;

const getPath = (state) => state.present.main.path;

const getRedirectUrl = (state) => state.present.main.redirectUrl;

const currentViewForm = createSelector(mainSelector, (state) => {
  const step = state?.currentForm?.type;
  if (!step) {
    return null;
  }
  return pages[step];
});

const getNextButtonName = ({ type, summary, last }) => {
  if (type === 'directive_question_select') {
    if (summary) {
      return 'Сформировать лист согласования';
    }
    if (last) {
      return 'Закончить формирование вопросов по директиве';
    }
    return 'Перейти к вопросам следующего ИП';
  }
  return 'Далее';
};

const getAdditionalButtons = (target, status, path) => {
  const res = [];
  const isEdit = status === 'edit';
  if (isEdit && path === 'directive') {
    res.push({
      name: 'Отмена',
      action: { type: types.EXIT },
    });
  }
  if (target.type === 'directive_question_select' && target.summary && isEdit) {
    res.push({
      name: 'Добавить  вопрос',
      action: { type: types.NEXT_STEP_SUCCEEDED, payload: { type: 'ip_select' } },
    });
  }
  return res;
};

const navbarInfo = createSelector([currentTarget, getStatus, getPath], (target, status, path) => {
  return {
    backName: 'Назад',
    nextName: getNextButtonName(target),
    additionalButtons: getAdditionalButtons(target, status, path),
  };
});

const isDisabledSavePage = createSelector([mainSelector], (state) => {
  if (state.path === 'directive') {
    return false;
  }
  if (state?.currentForm?.id === 'gid') {
    return true;
  }
  if (state.path === 'deal') {
    return state?.currentForm?.type === 'form';
  }
  return state?.currentForm?.type !== 'question' && state?.currentForm?.type !== 'question_edit';
});

const isShowSaveButton = createSelector([mainSelector], (state) => {
  return state.path === 'proposal' || state.path === 'deal' || (state.path === 'directive' && state.status === 'edit');
});

const isDisabledStartPage = createSelector([mainSelector, getPast], (state, past) => {
  if (!past?.length && (state?.currentForm?.type === 'nomination' || state?.currentForm?.type !== 'deal')) {
    return false;
  }

  return state?.currentForm?.type === 'settings' || (state?.currentForm?.type === 'form' && !past?.length);
});

const isDisabledEndPage = createSelector([getFuture, currentViewForm], (future, info) => {
  return !info?.nextStep && future.length === 0;
});

const getBreadcrumb = (state) => {
  return state.present.forms.breadcrumb;
};

export {
  getPresentSelector,
  getRedirectUrl,
  getPath,
  mainSelector,
  isDisabledEndPage,
  isDisabledStartPage,
  currentViewForm,
  currentTarget,
  getStatus,
  getId,
  isShowSaveButton,
  isDisabledSavePage,
  navbarInfo,
  getBreadcrumb,
};
