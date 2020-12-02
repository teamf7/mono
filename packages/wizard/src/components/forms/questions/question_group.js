import React, { useState, useCallback } from 'react';
import { QuestionVoiting } from './questions_voiting';
import { QuestionTextBlock } from './question_text_block';
import { WizardQuestionText, WizardQuestionParamList, OtherQuestions, Hint } from '../../elements';

export const QuestionGroup = ({
  changeQuestionParamValues,
  toggleLinked,
  voteUpdate,
  questions,
  target,
  og,
  ou,
  mainQuestions,
  linkedQuestions,
  hiddenQuestions,
}) => {
  const { managementDepartment } = questions;
  const ouName = managementDepartment.find((o) => o.id === target.ou).name;

  /** выделение изменяемого поля */
  const [highlightedField, setHighlightedField] = useState(null);

  // переключаем вопрос из связанного и обратно
  const memoizedToggleLinked = useCallback((ouId, mainQuestionId, linkedQuestionId) => {
    toggleLinked({ target, ouId, mainQuestionId, linkedQuestionId });
  }, []);

  const memoizedVoteUpdate = useCallback(
    (v) => {
      voteUpdate({ target, v });
    },
    [target]
  );

  // обработка изменения значения поля
  const questionPropChange = (e) => {
    const idx = questions.ou.findIndex((o) => o.id === target.ou);
    changeQuestionParamValues({ id: target.id, target: e.target, idx });
  };

  /** установить подсветку изменяемого параметра */
  const questionPropsFocus = (e) => {
    setHighlightedField(e.target.name);
  };

  /** снять подсветку изменяемого параметра */
  const questionPropsLostFocus = () => {
    setHighlightedField(null);
  };

  const otherQuestions = hiddenQuestions.map((question) => {
    const title = question.title.split('#');
    for (const [index, elem] of title.entries()) {
      if (questions.paramsList[elem]) {
        const text = /wizardConstant_/.test(elem) ? ou.paramValues[elem] : questions.paramsList[elem].description || elem;

        title[index] = (
          <span className="question-params" key={index}>
            {text}
          </span>
        );
      }
    }
    return { ...question, title };
  });

  let paramsList = [];
  if (linkedQuestions.length) {
    const questionsList = [mainQuestions[target.step], ...linkedQuestions];
    questionsList.forEach((q, i) => {
      if (q.params) {
        for (const param of q.params || []) {
          if (paramsList.indexOf(param) === -1) {
            paramsList.push(param);
          }
        }
      }
    });
  } else {
    paramsList = mainQuestions[target.step].params;
  }

  return (
    <>
      <div className="question-group-title">
        {ouName} {target.id !== 'gid' && og.name}
      </div>
      <div className="question-editor-title">
        <div className="question-editor-title-block">
          <span>Вопрос №{target.step + 1}</span>
          <br />
          <WizardQuestionText
            text={mainQuestions[target.step].title}
            paramsList={questions.paramsList}
            values={ou.paramValues}
            isTitle={true}
          /> 
          {mainQuestions[target.step].hint && <Hint text={mainQuestions[target.step].hint} />}
        </div>
        <QuestionVoiting onVoteUpdate={memoizedVoteUpdate} og={og} mainQuestions={mainQuestions} target={target} />
      </div>
      <div className="question-content">
        <div className="question-text-wrapper">
          <QuestionTextBlock
            highlightedField={highlightedField}
            paramsList={questions.paramsList}
            ou={ou}
            mainQuestions={mainQuestions}
            linkedQuestions={linkedQuestions}
            target={target}
            toggleLinked={memoizedToggleLinked}
          />
          <div className="question-group-title-type2">Добавить пункт проекта решения</div>
          <OtherQuestions
            key="question-add-linked"
            onClick={(i) => memoizedToggleLinked(ou.id, mainQuestions[target.step].id, i)}
            items={otherQuestions}
            nameKey="title"
          />
        </div>
        <div className="question-params-list">
          <WizardQuestionParamList
            onChange={questionPropChange}
            onFocus={questionPropsFocus}
            onBlur={questionPropsLostFocus}
            data={questions.paramsList}
            values={ou.paramValues}
            paramsList={paramsList}
            og={og}
          />
        </div>
      </div>
    </>
  );
};
