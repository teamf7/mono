import React, { useEffect, useReducer } from 'react';
import { Button } from './elements';
import '../styles/wizard.sass';
import { WizardQuestionEdit, WizardQuestionList } from './question';
import { useNav, WizardNavBar } from './navbar';
import reducer, {
  initialState,
  SET_APPROVAL_LIST,
  SET_CURRENT_OG,
  SET_QUESTION_GROUP,
  SET_DEALS_SELECTED,
} from '../util/wizard_reducer';
import * as API from '../util/api';
import { isDebug, isDeal } from '../util/util';
import WizardApproval from './approval';
import WizardDealSelection from './deal_selection';

export const isLocal = false; // !!!!-------------Определяет какой вариат json будет использоваться true - локальный false - удаленный. ПЕРЕД БИЛДОМ ПЕРЕКЛЮЧИТЬ НА FALSE!!-----------------------
export const WizardContext = React.createContext({ og: {}, local: isLocal });

export default function Wizard() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { target = {}, newStep, buttons, history } = useNav(state, dispatch);
  let isLoaded = false;
  switch (target.type) {
    case 'settings':
    case 'question_edit':
    case 'deal_sum':
    case 'deal_side':
    case 'deal_selection':
    case 'approval':
      isLoaded = true;
      break;
    case 'form':
      isLoaded = !!state.forms.length;
      break;
    case 'question':
      isLoaded = !!state.questionGroups[target.id];
      break;
    case 'deal_subject':
      isLoaded = !!state.dealSubjects[target.id];
      break;
  }

  useEffect(() => {
    if (!target.type && !state.init) {
      if (!isDeal) {
        API.initIP(dispatch, newStep);
      }
    } else {
      switch (target.type) {
        case 'form':
          if (!state.forms.length) {
            if (!isDeal) {
              API.fetchForms(state.og.id, dispatch);
            }
          }
          break;
        case 'question':
          if (!state.questionGroups[target.id]) {
            API.fetchQuestionGroup(target.id, state.og.id, dispatch);
          }
          break;
      }
    }
  }, [state, target, newStep]);

  const onQuestionDataReady = (data) => {
    dispatch({
      type: SET_QUESTION_GROUP,
      id: target.id,
      data,
    });
  };

  let content;
  switch (target.type) {
    case 'settings':
      const onOgChange = (id) => dispatch({ type: SET_CURRENT_OG, data: id });
      content = <WizardSettings setOg={onOgChange} og={state.og} ogList={state.ogList} />;
      break;
    case 'approval':
      const onApprovalUpdate = (data) =>
        dispatch({
          type: SET_APPROVAL_LIST,
          data: {
            ...state.approvalList,
            [target.id]: data,
          },
        });

      content = (
        <WizardApproval
          list={state.approvalList[target.id]}
          type={target.id}
          questions={state.questionGroups[target.qid]}
          onUpdate={onApprovalUpdate}
        />
      );
      break;
    case 'deal_selection':
      const onDealSelection = (data) =>
        dispatch({
          type: SET_DEALS_SELECTED,
          data,
        });

      content = <WizardDealSelection data={state.deals} onUpdate={onDealSelection} />;
      break;
    case 'form':
      const currentForm = state.forms.find((form) => (target.id ? form.id === target.id : !form.parentFormId));
      const formElementClick = (id) => {
        const newTarget = currentForm.items[id].target;
        if (typeof newTarget.type !== 'undefined') {
          newStep(newTarget);
        } else {
          alert('Not enough data to continue');
        }
      };
      content = <WizardForm data={currentForm} onClick={formElementClick} />;
      break;
    case 'question':
      content = (
        <WizardQuestionList
          data={state.questionGroups[target.id]}
          onDataReady={onQuestionDataReady}
          parent={
            isDebug
              ? state.forms
                  .find((f) => f.id === history[history.findIndex((h) => h === target) - 1].id)
                  .items.find((i) => i.target.id === target.id && i.target.type === 'question')
              : false
          }
        />
      );
      break;
    case 'question_edit':
      content = (
        <WizardQuestionEdit
          data={state.questionGroups[target.id]}
          onDataReady={onQuestionDataReady}
          target={target}
          newStep={newStep}
          parent={
            isDebug
              ? state.forms[state.og.id]
                  .find((f) => f.id === history[history.findIndex((h) => h.id === target.id && h.type === 'question') - 1].id)
                  .items.find((i) => i.target.id === target.id && i.target.type === 'question')
              : false
          }
        />
      );
      break;
  }

  return (
    <div className="wizard">
      <WizardContext.Provider value={{ og: state.og }}>
        <div className="form-body">{content}</div>
        <WizardNavBar buttons={buttons} />
      </WizardContext.Provider>
    </div>
  );
}

function WizardSettings({ setOg, og, ogList }) {
  const ogOptions = ogList.map((og) => (
    <option value={og.id} key={og.id}>
      {og.name}
    </option>
  ));
  return (
    <>
      <div className="form-title">Создание ИП</div>
      <div className="form-buttons">
        <div className="form-item">
          <label className="form-label">Наименование ОГ</label>
          <div className="wizard-element-select-wrapper">
            <select className="wizard-element-select" value={og.id} onChange={(e) => setOg(parseInt(e.target.value))}>
              {ogOptions}
            </select>
          </div>
        </div>
        <div className="form-item">
          <label className="form-label">Инициатор ИП</label>
          <div className="prop-text">{og.initiator.name}</div>
        </div>
      </div>
    </>
  );
}

function WizardForm({ data, onClick }) {
  // простая форма с кнопками
  const buttons = [];
  if (typeof data === 'undefined') {
    return;
  }
  for (const formElementId in data.items) {
    // TODO сделать для различных типов кнопок
    buttons.push(
      <Button
        value={data.items[formElementId].text}
        key={formElementId}
        onClick={() => onClick(formElementId)}
        selected={data.items[formElementId].selected ? 1 : 0}
      />
    );
  }
  return (
    <>
      <div className="form-title">{data.title}</div>
      <div className="form-buttons">{buttons}</div>
    </>
  );
}
