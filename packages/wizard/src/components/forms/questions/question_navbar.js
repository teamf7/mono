import React from 'react';

export const QuestionNavBar = ({ ou, ouList, target, newStep, onClick }) => {
  return ou.map((ou) => {
    const ouName = ouList.find((o) => o.id === ou.id).name;
    const selected = ou.questions.filter((q) => q.selected);
    if (!selected.length) {
      return null;
    }
    const buttons = selected.map((q, index) => (
      <div
        key={'qNavBar-' + index + '-' + ou.id}
        onClick={() =>
          onClick({
            ...target,
            ou: ou.id,
            step: index,
            isEditable: true,
          })
        }
        className={`question-navbar-item ${
          target.ou === ou.id && target.step === index
            ? 'question-navbar-item-current'
            : ''
          }`}
      >
        <span className="question-navbar-count">{index + 1}</span>
      </div>
    ));
    return (
      <div key={'qNavBar-' + ou.id} className="question-navbar-block-item">
        <div className="form-label">{ouName}</div>
        <div
          className={`question-navbar ${
            buttons.length > 4 ? 'question-navbar-wide' : ''
            }`}
        >
          {buttons}
        </div>
      </div>
    );
  });
}
