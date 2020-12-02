import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiWindowClose } from '@mdi/js';
import { WizardQuestionText } from '../../elements';

export const QuestionTextBlock = ({
  highlightedField,
  paramsList,
  ou,
  mainQuestions,
  linkedQuestions,
  target,
  toggleLinked,
}) => {
  if (!linkedQuestions.length) {
    return (
      <div className="question-text">
        <WizardQuestionText
          text={mainQuestions[target.step].text}
          paramsList={paramsList}
          values={ou.paramValues}
          highlightedField={highlightedField}
        />
      </div>
    );
  }
  const questions = [mainQuestions[target.step], ...linkedQuestions];
  return questions.map((q, i) => {
    const deleteBtn = i ? (
      <Icon
        className="icon-close icon-close-questions"
        path={mdiWindowClose}
        onClick={() => toggleLinked(ou.id, mainQuestions[target.step].id, q.id)}
      />
    ) : (
      ''
    );
    return (
      <div className="question-text" key={'qText-' + q.id}>
        {deleteBtn} {i + 1}.
        <WizardQuestionText text={q.text} paramsList={paramsList} values={ou.paramValues} highlightedField={highlightedField} />
      </div>
    );
  });
};
