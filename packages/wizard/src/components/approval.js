import React, { useContext, useMemo, useRef, useState, useEffect, Fragment } from 'react';
import { WizardContext } from './wizard';
import server from '../util/server';
import Icon from '@mdi/react';
import { mdiPlus } from '@mdi/js';
import { DropdownMenu, Datalist } from './elements';
import { Header } from './forms/header';

import '../styles/ui-components/table.sass';

const approvalTypes = {
  og: { name: 'ОГ', onlyAdditional: true },
  cauk: { name: 'ЦАУК' },
};

export default function WizardApproval({ list, questions, onUpdate, type }) {
  const { og } = useContext(WizardContext);
  const ogName = type === 'cauk' ? 'ПАО  НК «Роснефть»' : og.name;
  const approverSelect = useRef({});

  const questionList = useMemo(() => {
    const res = [];
    for (const ou of questions.ou) {
      const selected = ou.questions.filter((q) => q.selected);

      if (!selected.length) {
        continue;
      }

      for (const q of selected) {
        if (!res.find((question) => question.id === q.question.id)) {
          res.push(q.question);
        }
      }
    }
    return res;
  }, [questions]);

  const approverIndex = {};
  const approverOptions = {};

  for (const [group, approvers] of Object.entries(list)) {
    approverOptions[group] = [];
    for (const [index, approver] of approvers.entries()) {
      approverIndex[approver.id] = { group, index };
      if (!approver.selected) {
        const disabled = !!list.additional.find((a) => a.id === approver.id);
        approverOptions[group].push(
          <option key={approver.id} value={approver.id} disabled={disabled}>
            {approver.name}
          </option>
        );
      }
    }
  }
  const searchParam = useMemo(() => {
    const data = {
      type: 'datalist',
      url: server + '/API/internal/v1/get_approver.php?',
      key: 'name',
    };
    if (type === 'cauk') {
      data.url += 'cauk=1';
    }
    return data;
  }, [type]);

  const onDelete = (userId) => {
    const { group, index } = approverIndex[userId];
    const newList = list[group].slice();
    if (group !== 'additional') {
      newList.splice(index, 1, {
        ...list[group][index],
        selected: false,
      });
    } else {
      newList.splice(index, 1);
    }
    onUpdate({ ...list, [group]: newList });
  };

  const onAdd = (group) => {
    const { index } = approverIndex[approverSelect.current[group].value];

    const newList = list[group].slice();
    newList.splice(index, 1, {
      ...newList[index],
      selected: true,
    });
    onUpdate({ ...list, [group]: newList });
  };

  const onApproverSearch = ({ target: { value } }) => {
    value.question = new Set();
    onUpdate({ ...list, additional: [...list.additional, value] });
  };

  const toggleQuestion = (approverId, questionId) => {
    const { group, index } = approverIndex[approverId];
    const newList = list[group].slice();
    const newSet = new Set(newList[index].question);

    if (newSet.has(questionId)) {
      newSet.delete(questionId);
    } else {
      newSet.add(questionId);
    }
    newList[index] = {
      ...newList[index],
      question: newSet,
    };
    onUpdate({ ...list, [group]: newList });
  };

  const approvers = Object.entries(list).map(([group, users]) => {
    const isAdditional = group === 'additional';
    const selectedUsers = isAdditional ? users : users.filter((a) => a.selected);

    const display = selectedUsers.map((a) => {
      const questions = questionList.map((q, i) => {
        const selected = a.question.has(q.id);
        const onClick = isAdditional ? () => toggleQuestion(a.id, q.id) : null;

        return (
          <div
            key={`approver-${a.id}-${q.id}`}
            className={`stage__item ${selected ? ' stage__item_selected' : ''}`}
            title={q.title.replace(/#[a-zA-Z0-9._]*?#/g, '')}
            onClick={onClick}
          >
            {i + 1}
          </div>
        );
      });

      return (
        <tr key={`approver-${a.id}`} className="table__row">
          <td className="table__cell">
            <div className="content-name">{a.name}</div>
            <div className="content-position">{a.position}</div>
          </td>
          <td className="table__cell">
            <div className="stage">{questions}</div>
          </td>
          <td className="table__cell">
            <DropdownMenu
              items={[
                {
                  display: 'Удалить',
                  onClick: () => onDelete(a.id),
                },
              ]}
            />
          </td>
        </tr>
      );
    });

    return {
      group,
      isAdditional,
      display,
    };
  });

  const mainApprovers = approvers
    .filter((a) => !a.isAdditional)
    .map((a, i) => {
      const selectionDisabled = approverOptions[a.group].length === 0;

      return (
        <Fragment key={i}>
          <tr>
            <td className="approvers-group-name" colSpan="3">
              {a.group}
            </td>
          </tr>
          {a.display}
          {!selectionDisabled && (
            <tr>
              <td colSpan="3">
                <div className="wizard-element-select-wrapper">
                  <select
                    className="wizard-element-select"
                    ref={(s) => (approverSelect.current[a.group] = s)}
                    style={{ width: '50%', marginRight: '1em' }}
                  >
                    {approverOptions[a.group]}
                  </select>

                  <button className="button-add" disabled={selectionDisabled} onClick={() => onAdd(a.group)}>
                    <Icon className="icon-add" path={mdiPlus} />
                    Добавить
                  </button>
                </div>
              </td>
            </tr>
          )}
        </Fragment>
      );
    });

  const additionalApprovers = approvers.filter((a) => a.isAdditional).map((a) => a.display);
  return (
    <>
      <Header title={`Согласование ${approvalTypes[type].name}`} />
      <div className="form-title"></div>
      <div className="question-body-wide">
        {!approvalTypes[type].onlyAdditional ? (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead className="table__head">
                  <tr className="table__row">
                    <th className="table__cell table__cell_head">ФИО/Должность</th>
                    <th className="table__cell table__cell_head">{ogName}</th>
                    <th />
                  </tr>
                </thead>
                <tbody className="table__body">{mainApprovers}</tbody>
              </table>
            </div>
            <div className="question-group-title-type2">Прочие согласующие на усмотрение Инициатора / Куратора</div>
          </>
        ) : (
          ''
        )}
        <div className="table-wrapper">
          <table className="table table-other-approver">
            <thead className="table__head">
              <tr className="table__row">
                <th className="table__cell table__cell_head">ФИО/Должность</th>
                <th className="table__cell table__cell_head">{ogName}</th>
                <th />
              </tr>
            </thead>
            <tbody className="table__body">{additionalApprovers}</tbody>
          </table>
        </div>
        <div className="select-row">
          <Datalist data={searchParam} onChange={onApproverSearch} name="approver-search" />
        </div>
        <div className="footnote"></div>
      </div>
    </>
  );
}
