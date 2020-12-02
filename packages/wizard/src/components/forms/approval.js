import React, { useMemo, useRef, useCallback, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Icon from '@mdi/react';
import { mdiPlus } from '@mdi/js';

import { DropdownMenu, Datalist } from '../elements';
import { actions } from '../../actions';
import { Header } from './header';
import { getCurrentOg, getApprovalQuestions, getApprovalList, currentTarget, getApprovalHint } from '../../reselect';
import '../../styles/ui-components/table.sass';
import server from '../../util/server';

const approvalTypes = {
  og: { name: 'ОГ', onlyAdditional: true },
  directive: { name: 'Директивы', onlyAdditional: true },
  cauk: { name: 'ЦАУК' },
};

function WizardApproval({
  list,
  og,
  questions,
  target,
  hint,
  changeApprover,
  toggleApproverQuestion,
  setSelectedGroupApprover,
  setUnselectedGroupApprover,
}) {
  const ogName = target.id === 'cauk' ? 'ПАО  НК «Роснефть»' : og.name;
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
    if (target.id === 'cauk') {
      data.url += 'cauk=1';
    }
    return data;
  }, [target.id]);

  const memoizedDelete = useCallback(
    (userId) => {
      const { group, index } = approverIndex[userId];
      setUnselectedGroupApprover({ target, group, index });
    },
    [target, approverIndex]
  );

  const memoizedAdd = useCallback(
    (group) => {
      const { index } = approverIndex[approverSelect.current[group].value];

      setSelectedGroupApprover({ target, group, index });
    },
    [target, approverIndex]
  );

  const memoizedChangeApprover = useCallback(
    ({ target: { value } }) => {
      if (!value) {
        return;
      }
      value.question = new Set();
      changeApprover({ target, value });
    },
    [target]
  );

  const memoizedToggleQuestion = useCallback(
    (approverId, questionId) => {
      toggleApproverQuestion({ target, approverId, questionId });
    },
    [target]
  );

  const approvers = Object.entries(list).map(([group, users]) => {
    const isAdditional = group === 'additional';
    const selectedUsers = isAdditional ? users : users.filter((a) => a.selected);

    const display = selectedUsers.map((a) => {
      const questions = questionList.map((q, i) => {
        const selected = a.question.has(q.id);
        const onClick = isAdditional ? () => memoizedToggleQuestion(a.id, q.id) : null;

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
                  onClick: () => memoizedDelete(a.id),
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

                  <button className="button-add" disabled={selectionDisabled} onClick={() => memoizedAdd(a.group)}>
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

  if (!list) {
    return null;
  }

  return (
    <>
      <Header title={`Согласование ${approvalTypes[target?.id].name}`} />
      <div className="question-body-wide">
        {!approvalTypes[target?.id].onlyAdditional ? (
          <>
            {mainApprovers.length > 0 && (
              <div className="table-wrapper table-wrapper-approval">
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
            )}
            <div className="question-group-title-type2">Прочие согласующие на усмотрение Инициатора / Куратора</div>
          </>
        ) : (
          ''
        )}
        <div className="table-wrapper table-wrapper-approval">
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
          <Datalist data={searchParam} onChange={memoizedChangeApprover} name="approver-search" og={og} />
        </div>
        <div className="footnote">{hint}</div>
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    target: currentTarget(state),
    og: getCurrentOg(state),
    questions: getApprovalQuestions(state),
    list: getApprovalList(state),
    hint: getApprovalHint(state),
  };
};

// Добавляем actions к this.props
const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(WizardApproval);
