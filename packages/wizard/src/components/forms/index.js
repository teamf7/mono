import WizardSettings from './wizard_settings';
import WizardForm from './wizard_form';
import WizardDealStart from './deal/start';
import WizardDealSide from './deal/side';
import WizardDealSum from './deal/sum';
import WizardDealSubject from './deal/subject';
import WizardDealSubjectBasic from './deal/subject_basic';
import WizardDealJustification from './deal/justificaton';
import WizardQuestionList from './questions/question';
import QuestionEdit from './questions/question_edit';
import WizardDealSelection from './deal_selection';
import WizardApproval from './approval';
import Nomination from './nomination';
import { types } from '../../actions';
import { resolveParamCondition } from '../../util/util';
import {
  dealSidesSelector,
  getOuList,
  currentTarget,
  dealSubjectSelector,
  getNominationOptions,
  getNominationOg,
  getAllQuestions,
  getIpList,
  getSelectedIp,
  getStatus,
  getDealTypical,
} from '../../reselect';
import NominationList from './nomination_list';
import DirectiveKmSelect from './directive/km_select';
import DirectiveIpSelect from './directive/ip_select';
import DirectiveQuestionSelect from './directive/question_select';
import DirectiveApproval from './directive/approval';

export const pages = {
  settings: {
    title: 'Создание ИП',
    component: WizardSettings,
    nextStep: 'form',
    validation: (state) => {
      return { isValid: true };
    },
  },
  settings_gid: {
    isFunc: true,
    title: 'Создание справки на ГИД',
    component: WizardSettings,
    nextStep: 'question',
    validation: (state) => {
      return { isValid: true };
    },
    func: (state) => {
      return {
        type: 'question',
        id: 'gid',
        path: 'gid',
      };
    },
  },
  form: {
    component: WizardForm,
    nextStep: null,
    validation: (state) => {
      return { isValid: true };
    },
  },
  deal_start: {
    component: WizardDealStart,
    nextStep: true,
    isNext: () => {
      return {
        success: true,
        type: types.NEXT_AFTER_DEAL_START,
      };
    },
    validation: (state) => {
      return { isValid: true };
    },
  },
  deal_sum: {
    component: WizardDealSum,
    nextStep: true,
    isPrev: () => true,
    isNext: () => {
      return {
        success: true,
        type: types.GO_TO_DEAL_SUBJECT,
      };
    },
    validation: (state) => {
      return { isValid: true };
    },
  },
  deal_side: {
    component: WizardDealSide,
    nextStep: true,
    isFunc: true,
    isPrev: () => true,
    validation: (state) => {
      const sideName = [' первой стороны', ' второй стороны'];
      const sides = dealSidesSelector(state);
      let errorText = null;
      sides.some((side) => {
        // В первую очередь должна быть указана Организация для всех сторон
        if (!side.id) {
          errorText = 'Необходимо указать организацию для каждой стороны сделки';
        } else {
          sides.some((side, sideNum) => {
            // У первой и второй стороны БСА обязательно
            const conditionBsa = sideNum < 2 && side.isOg && !parseFloat(side.bsa);
            const conditionBsaDate = sideNum < 2 && side.isOg && !side.bsaDate;
            if (conditionBsa) {
              errorText = 'Необходимо указать БСА' + sideName[sideNum];
            } else if (conditionBsaDate) {
              errorText = 'Необходимо указать дату БСА' + sideName[sideNum];
            }
            return conditionBsa || conditionBsaDate;
          });
        }
        return !side.id;
      });
      return { isValid: errorText === null, text: errorText };
    },
    func: (state) => {
      // переход на сумму сделки
      return {
        type: 'deal_sum',
      };
    },
  },
  deal_subject_basic: {
    component: WizardDealSubjectBasic,
    nextStep: true,
    validation: (state) => {
      return { isValid: true };
    },
    isNext: (state) => {
      return {
        success: true,
        type: types.NEXT_STEP_SUCCEEDED,
        payload: {
          type: 'deal_justification',
        },
      };
    },
  },
  deal_subject: {
    component: WizardDealSubject,
    nextStep: true,
    isPrev: () => true,
    validation: (state) => {
      return { isValid: true };
    },
    isNext: (state) => {
      const subject = dealSubjectSelector(state);
      const checks = Object.entries(subject.params).filter(([param, data]) => data.type === 'warning');
      for (const [param, check] of checks) {
        const success = resolveParamCondition(check.condition, subject.params, subject.paramValues);
        if (!success) {
          alert(check.description);
          return;
        }
      }
      let finished = true;
      const paramsToValidate = Object.entries(subject.params).filter(
        (p) => p.type && !['ref', 'hint', 'subtextCondition', 'warning'].includes(p.type)
      );
      for (const [key, param] of paramsToValidate) {
        const val = subject.paramValues[key];
        if (!val || (Array.isArray(val) && !val.length)) {
          finished = false;
          break;
        }
      }
      const confirmText = finished
        ? 'Вы уверены, что хотите завершить формирование предмета сделки?'
        : 'Предметы сделок не заполнены,  вы уверены, что хотите завершить их формирование?';
      if (!window.confirm(confirmText)) {
        return;
      }
      return {
        success: true,
        type: types.NEXT_STEP_SUCCEEDED,
        payload: {
          type: 'deal_justification',
        },
      };
    },
    isFunc: true,
    func: () => false,
  },
  deal_justification: {
    component: WizardDealJustification,
    nextStep: true,
    validation: (state) => {
      return { isValid: true };
    },
    isNext: (state) => {
      return { success: true, type: types.SAVE_DEAL };
    },
  },
  question: {
    component: WizardQuestionList,
    isFunc: true,
    nextStep: 'question_edit',
    isPrev: () => true,
    func: (state) => {
      const target = currentTarget(state);
      const ouList = getOuList(state);

      const question_visible_index = ouList.findIndex((el, index) => {
        return el.questions.filter((q) => q.selected === true)?.length;
      });

      if (question_visible_index !== -1) {
        return {
          type: 'question_edit',
          id: target.id,
          ou: ouList[question_visible_index].id,
          step: 0,
        };
      }
      return {
        error: 'Не выбран вопрос',
      };
    },
    validation: (state) => {
      const ouList = getOuList(state);

      const question_visible_index = ouList.findIndex((el, index) => {
        return el.questions.filter((q) => q.selected === true)?.length;
      });
      if (question_visible_index === -1) {
        return { isValid: false, text: 'Не выбран вопрос' };
      }
      return { isValid: true };
    },
  },
  question_edit: {
    title: 'Формулировки вопросов и проекты решений',
    component: QuestionEdit,
    isFunc: true,
    nextStep: 'question_edit',
    isPrev: (state) => {
      const nextStep = -1;
      const target = currentTarget(state);
      const ouList = getOuList(state).filter((ou) => ou.questions.filter((el) => el.selected).length > 0);
      const ouIndex = ouList.findIndex((o) => o.id === target.ou);
      return ouIndex === 0 && target.step + nextStep < 0;
    },
    isNext: (state) => {
      const nextStep = 1;
      const target = currentTarget(state);
      const ouList = getOuList(state).filter((ou) => ou.questions.filter((el) => el.selected).length > 0);
      const ouIndex = ouList.findIndex((o) => o.id === target.ou);
      const selectedQuestions = ouList[ouIndex].questions.filter((q) => q.selected);

      if (target.id === 'gid') {
        return {
          type: types.SET_APPROVAL,
          success: ouIndex === ouList.length - 1 && target.step + nextStep === selectedQuestions.length,
        };
      }

      return {
        type: types.PUSH_QUESTIONS,
        success: ouIndex === ouList.length - 1 && target.step + nextStep === selectedQuestions.length,
      };
    },
    func: (state, next) => {
      const nextStep = next ? 1 : -1;
      const target = currentTarget(state);
      const ouList = getOuList(state).filter((ou) => {
        return ou.questions.filter((el) => el.selected).length > 0;
      });

      const ouIndex = ouList.findIndex((o) => o.id === target.ou);
      const selectedQuestions = ouList[ouIndex].questions.filter((q) => q.selected === true);

      if (target.step + nextStep === selectedQuestions.length || (!next && target.step === 0)) {
        const question_visible_index = ouList.findIndex((el, index) => {
          if (index === ouIndex) {
            return false;
          }
          return el.questions.filter((q) => q.selected === true)?.length;
        });
        return {
          ...target,
          isEditable: true,
          ou: ouList[question_visible_index].id,
          step: next ? 0 : ouList[question_visible_index].questions.length - 1,
        };
      } else {
        return {
          ...target,
          isEditable: true,
          step: target.step + nextStep,
        };
      }
    },
    validation: (state) => {
      const allQuestions = getAllQuestions(state);

      let errorText = null;
      allQuestions.some(({ voteResult }, idx) => {
        // У первой и второй стороны БСА обязательно
        const condition = voteResult === '';
        if (condition) {
          errorText =
            'Необходимо принять решение по выносимым вопросам. Вернитесь на страницу с принятием решения по вопросу и проголосуйте';
        }
        return condition;
      });
      return { isValid: errorText === null, text: errorText };
    },
  },
  approval: {
    component: WizardApproval,
    nextStep: 'approval',
    isNext: (state) => {
      return {
        type: types.SET_APPROVAL,
        success: true,
      };
    },
    validation: (state) => {
      return { isValid: true };
    },
  },
  km_select: {
    nextStep: true,
    component: DirectiveKmSelect,
    isNext: () => {
      return {
        type: types.NEXT_AFTER_KM_SELECT,
        success: true,
      };
    },
    validation: (state) => {
      return { isValid: true };
    },
  },
  ip_select: {
    component: DirectiveIpSelect,
    nextStep: true,
    isPrev: () => true,
    isFunc: true,
    func: (state) => {
      const selected = getSelectedIp(state);
      return {
        type: 'directive_question_select',
        idx: 0,
        last: 1 === selected.length,
      };
    },
    validation: (state) => {
      const ips = getSelectedIp(state);
      if (!ips.length) {
        return { isValid: false, text: 'Выберите ИП' };
      }
      return { isValid: true };
    },
  },
  directive_question_select: {
    component: DirectiveQuestionSelect,
    nextStep: true,
    isFunc: true,
    isNext: (state) => {
      const target = currentTarget(state);
      if (target.summary) {
        return {
          success: true,
          type: types.GO_TO_DIRECTIVE_APPROVAL,
        };
      }
    },
    func: (state, next) => {
      const target = currentTarget(state);
      const ips = getSelectedIp(state, true);
      if (next) {
        if (target.summary) {
          return false;
        } else {
          const next = (target.idx || 0) + 1;
          return {
            type: 'directive_question_select',
            idx: next,
            last: next === ips.length - 1,
            summary: target.last,
          };
        }
      } else {
        if (target.idx) {
          const prev = target.idx - 1;
          return { type: 'directive_question_select', idx: prev, last: target.summary };
        } else {
          const status = getStatus(state);
          return { type: status === 'edit' ? 'km_select' : 'ip_select' };
        }
      }
    },
    validation: (state) => {
      return { isValid: true };
    },
  },
  directive_approval: {
    component: DirectiveApproval,
    nextStep: true,
    isNext: () => {
      return {
        type: types.SAVE_DIRECTIVE,
        success: true,
      };
    },
    validation: (state) => {
      return { isValid: true };
    },
  },
  deal_selection: {
    title: 'Выбор сделок',
    component: WizardDealSelection,
    nextStep: true,
    isNext: () => {
      return {
        type: types.SET_NEXT_STEP_AFTER_DEAL_SELECTION,
        success: true,
      };
    },
    validation: (state) => {
      return { isValid: true };
    },
  },
  nomination: {
    title: 'Выдвижение',
    component: Nomination,
    nextStep: true,
    isNext: () => {
      return {
        success: true,
        type: types.GO_TO_NOMINATION_LIST,
      };
    },
    validation: (state) => {
      const options = getNominationOptions(state);
      const og = getNominationOg(state);

      if (!options.find((o) => o.ID === og) || !og) {
        return { isValid: false, text: 'Выберите ОГ' };
      }
      return { isValid: true };
    },
  },
  nomination_list: {
    nextStep: true,
    component: NominationList,
    isNext: () => ({ success: true, type: types.SAVE_NOMINATION }),
    validation: (state) => {
      return { isValid: true };
    },
  },
};
