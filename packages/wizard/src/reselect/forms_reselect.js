import { createSelector } from 'reselect';
import { mainSelector } from './main_reselect';

// Обычная функция извлекающая нужный срез данных из состояния
const formsSelector = (state) => {
  return state.present.forms;
};

const getCurrentOg = (state) => {
  return state.present.forms.og;
};

// селектор на основе функции, позволяет за
const currentFormInfo = createSelector([formsSelector, mainSelector], (formsSelector, mainSelector) => {
  return formsSelector.forms.find((form) => {
    return mainSelector.currentForm.id ? form.id === mainSelector.currentForm.id : !form.parentFormId;
  });
});

export { formsSelector, getCurrentOg, currentFormInfo };
