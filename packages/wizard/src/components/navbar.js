import React, { useState } from 'react';
import { Button } from './elements';
import { WizardQuestionText } from './question';
import { ADD_DEAL_SIDE, SET_APPROVAL_LIST, SET_QUESTION_GROUP, SET_DEALS_LIST } from '../util/wizard_reducer';
import server, { isDebug } from '../util/server';
import { prepareApprovalJson, prepareQuestionJson } from '../util/util';

const questionToRequest = (group, og = {}) => {
  const ou = group.ou.map((managementDepartment) => {
    let result = {};
    result[managementDepartment.id] = {};
    result[managementDepartment.id]['questions'] = managementDepartment.questions.map((question) => {
      const text = WizardQuestionText({
        text: question['question']['text'],
        paramsList: group['paramsList'],
        values: managementDepartment['paramValues'],
        textReturn: true,
      });
      const title = WizardQuestionText({
        text: question['question']['title'],
        paramsList: group['paramsList'],
        values: managementDepartment['paramValues'],
        textReturn: true,
      });
      return {
        parentId: question['parentId'],
        position: question['position'],
        voteResult: question['question']['voteResult'],
        text: text.join(' '),
        title: title.join(' '),
        values: managementDepartment.paramValues,
        questionID: question['question'].id,
      };
    });
    result[managementDepartment.id]['values'] = managementDepartment.paramValues;
    return result;
  });
  const body = {
    ou,
    group: group.id,
  };

  if (og) {
    body.og = og.id;
    body.initiator = og.initiator;
  }
  return body;
};

const pushQuestions = (questions, currentOg, questionGroupID, redirectUrl, dispatch, newStep) => {
  const body = questionToRequest(questions[questionGroupID], currentOg);
  const url = server + '/API/internal/v1/wizard_save.php';
  const params = isDebug
    ? {}
    : {
        method: 'post',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: JSON.stringify({ body }),
      };
  fetch(url, params)
    .then((response) => response.json())
    .then((result) => {
      let redirect = true;
      if (result.deals) {
        dispatch({
          type: SET_DEALS_LIST,
          data: result.deals,
        });
        redirect = false;
        newStep({ type: 'deal_selection' });
      }
      if (result.gid) {
        dispatch({
          type: SET_QUESTION_GROUP,
          id: 'gid',
          data: prepareQuestionJson(result.gid),
        });
        if (redirect) {
          redirect = false;
          newStep({ type: 'question', id: 'gid' });
        }
      }
      if (result.approvalList2) {
        dispatch({
          type: SET_APPROVAL_LIST,
          data: prepareApprovalJson(result),
        });
        if (redirect) {
          redirect = false;
          newStep({ type: 'approval', id: 'og', qid: questionGroupID });
        }
      }
      if (redirect) {
        window.location = redirectUrl;
      }
    })
    .catch(console.log);
};

const pushSubject = (sum, sides, subject, isAgent, redirectUrl) => {
  let result = {
    text: WizardQuestionText({
      text: subject.text,
      paramsList: subject.params,
      values: subject.paramValues,
      textReturn: true,
    }).join(' '),
    title: subject.title,
    values: subject.paramValues,
    id: subject.id,
    sides,
    sum,
    isAgent,
  };
  fetch(server + '/API/internal/v1/wizard_save.php?type=dealSubject', {
    method: 'post',
    body: JSON.stringify(result),
  })
    .then((response) => response.json())
    .then((result) => {
      if (redirectUrl) {
        window.location = redirectUrl + result.id + '/';
      }
    });
};

const pushIP = (approval, gid, selectedDeals, redirectUrl) => {
  const body = {
    approval,
    gid: typeof gid === 'undefined' ? {} : questionToRequest(gid),
    selectedDeals,
  };
  fetch(server + '/API/internal/v1/wizard_save.php?type=approval', {
    method: 'post',
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((result) => {
      if (redirectUrl) {
        window.location = redirectUrl + result.id + '/';
      }
    });
};

const pushDeal = (sum, sides, isAgent) => {
  const body = {
    sum,
    sides,
    isAgent,
  };
  fetch(server + '/API/internal/v1/wizard_save.php?type=deal', {
    method: 'post',
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then(({ ID }) => {
      window.location = '/deal/' + ID;
    });
};

export function useNav(state, dispatch) {
  const [step, setStep] = useState(-1);
  const [history, setHistory] = useState([]);
  const target = history[step];

  // переход на новый шаг
  const newStep = (newTarget) => {
    const newHistory = history.length - 1 > step ? history.slice(0, step + 1) : history.slice();
    if (target && target.type === 'question_edit' && newTarget.type === target.type && newTarget.ou === target.ou) {
      newHistory[step] = newTarget;
    } else {
      newHistory.push(newTarget);
      setStep(newHistory.length - 1);
    }
    setHistory(newHistory);
  };
  // назад - вперед по кнопкам
  const nav = (direction) => {
    switch (target.type) {
      case 'settings':
        switch (direction) {
          case 'forward':
            newStep({
              type: 'form',
            });
            break;
          case 'back':
            window.location = state.redirectUrl;
            break;
        }
        break;
      case 'form':
        switch (direction) {
          case 'forward':
            setStep(step + 1);
            break;
          case 'back':
            setStep(step - 1);
            break;
        }
        break;
      case 'deal_sum':
        switch (direction) {
          case 'forward':
            newStep({ type: 'deal_side', id: 0 });
            break;
          case 'back':
            window.location = state.redirectUrl;
            break;
        }
        break;
      case 'deal_selection':
        switch (direction) {
          case 'forward':
            if (state.questionGroups.gid) {
              newStep({ type: 'question', id: 'gid' });
            } else {
              const previousGroup = history.reverse().find((h) => h.type === 'question_edit' && h.id !== 'gid').id;
              newStep({ type: 'approval', id: 'og', qid: previousGroup });
            }
            break;
          case 'back':
            setStep(step - 1);
            break;
        }
        break;
      case 'deal_side':
        switch (direction) {
          case 'forward':
            if (target.id < 2 && !state.dealSides[target.id].role) {
              alert('Для продолжения заполните роль стороны ' + (target.id + 1));
            } else if (state.isAgent && !state.dealSum.reward) {
              alert('Не указан общий размер вознаграждения, укажите на 1 шаге');
            } else if (target.id === 0 && !parseFloat(state.dealSides[target.id].bsa)) {
              alert('Необходимо указать БСА');
            } else if (
              target.id === 1 &&
              state.dealSides[1].anotherSide &&
              (!history[step + 1] || history[step + 1].type !== 'deal_side')
            ) {
              // добавляем 3ю сторону
              dispatch({ type: ADD_DEAL_SIDE });
              newStep({ type: 'deal_side', id: 2 });
            } else if (target.id === (state.dealSides[1].anotherSide ? 2 : 1)) {
              // переход на выбор вида сделки
              if (target.id === 2) {
                pushDeal(state.dealSum, state.dealSides, state.isAgent);
              } else {
                newStep({ type: 'form' });
              }
            } else if (!history[step + 1]) {
              // следующая сторона
              newStep({ type: 'deal_side', id: target.id + 1 });
            } else {
              setStep(step + 1);
            }
            break;
          case 'back':
            setStep(step - 1);
            break;
        }
        break;
      case 'question':
        switch (direction) {
          case 'forward':
            const ouList = state.questionGroups[target.id].ou;
            for (let i = 0; i < ouList.length; i++) {
              const nextSelected = ouList[i].questions.filter((q) => q.selected === true);
              if (nextSelected.length) {
                newStep({
                  type: 'question_edit',
                  id: target.id,
                  ou: ouList[i].id,
                  step: 0,
                });
                return;
              }
            }
            alert('No questions selected');
            break;
          case 'back':
            setStep(step - 1);
            break;
        }
        break;
      case 'question_edit':
        const ouList = state.questionGroups[target.id].ou;
        const ouIndex = ouList.findIndex((o) => o.id === target.ou);
        switch (direction) {
          case 'forward':
            const selectedQuestions = ouList[ouIndex].questions.filter((q) => q.selected === true);
            if (target.step + 1 === selectedQuestions.length) {
              for (let i = ouIndex + 1; i < ouList.length; i++) {
                const nextSelected = ouList[i].questions.filter((q) => q.selected === true);
                if (nextSelected.length) {
                  newStep({
                    ...target,
                    ou: ouList[i].id,
                    step: 0,
                  });
                  return;
                }
              }
              if (target.id === 'gid') {
                const previousGroup = history.reverse().find((h) => h.type === 'question_edit' && h.id !== 'gid').id;
                newStep({ type: 'approval', id: 'og', qid: previousGroup });
              } else {
                pushQuestions(state.questionGroups, state.og, target.id, state.redirectUrl, dispatch, newStep);
              }
              return;
            } else {
              const newHistory = history.slice();
              newHistory[step] = {
                ...target,
                step: target.step + 1,
              };
              setHistory(newHistory);
            }
            break;
          case 'back':
            if (target.step > 0) {
              const newHistory = history.slice();
              newHistory[step] = {
                ...target,
                step: target.step - 1,
              };
              setHistory(newHistory);
            } else {
              setStep(step - 1);
            }
            break;
        }
        break;
      case 'deal_subject':
        switch (direction) {
          case 'forward':
            const subject = state.dealSubjects[target.id];
            let finished = true;
            for (const [key, param] of Object.entries(subject.params)) {
              if (!param.type || param.type === 'ref' || param.type === 'hint' || param.type === 'subtextCondition') {
                continue;
              }
              const val = subject.paramValues[key];
              if (!val || (Array.isArray(val) && !val.length)) {
                finished = false;
                break;
              }
            }
            if (
              (!finished &&
                window.confirm('Предметы сделок не заполнены,  вы уверены, что хотите завершить их формирование?')) ||
              (finished && window.confirm('Вы уверены, что хотите завершить формирование предмета сделки?'))
            ) {
              pushSubject(state.sum, state.dealSides, subject, state.isAgent, state.redirectUrl);
            }
            break;
          case 'back':
            setStep(step - 1);
            break;
        }
        break;
      case 'approval':
        switch (direction) {
          case 'forward':
            if (target.id === 'og') {
              newStep({ ...target, id: 'cauk' });
            } else {
              pushIP(state.approvalList, state.questionGroups.gid, state.deals.selected, state.redirectUrl);
            }
            break;
          case 'back':
            setStep(step - 1);
            break;
        }
        break;
    }
  };

  const forwardDisabled = !target || (target.type === 'form' && !history[step + 1]);

  return {
    target,
    history,
    newStep,
    buttons: {
      back: {
        text: 'Назад',
        type: 'button-simple',
        disabled: false,
        onClick: nav,
      },
      forward: {
        text: 'Далее',
        type: 'button-follow',
        disabled: forwardDisabled,
        onClick: nav,
      },
    },
  };
}

export function WizardNavBar({ buttons }) {
  // навигация по истории
  const display = [];
  for (const button in buttons) {
    display.push(
      <Button
        onClick={buttons[button].disabled ? null : () => buttons[button].onClick(button)}
        value={buttons[button].text}
        key={button}
        type={buttons[button].type}
        className={`button ${buttons[button].type} ${buttons[button].disabled ? 'disabled' : ''}`}
      />
    );
  }
  return <div className="navButtons">{display}</div>;
}
