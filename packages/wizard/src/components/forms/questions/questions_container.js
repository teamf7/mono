import React from 'react';
import { QuestionsList } from './question_list';
import { OtherQuestions } from '../../elements';
import { resolveConditionArray } from '../../../util/util';

export const QuestionsContainer = ({ questionGroups, og, onQuestionOrderChange, onQuestionSelect }) => {
  return questionGroups.ou.map((el) => {
    const ouName = questionGroups.managementDepartment.find((o) => o.id === el.id).name;
    const questions = el.questions.filter(q => {
      if(!q.question.conditions){
        return true;
      }
      return resolveConditionArray(q.question.conditions, questionGroups.paramsList, el.paramValues);
    });

    const mainQuestions = questions.filter((i) => i.position === 'alone');
    const hiddenQuestions = questions
      .filter((i) => i.position === 'hidden' || i.position === 'linked')
      .map(({ question }) => {
        const title = question.title.split('#');
        for (const [index, elem] of title.entries()) {
          if (questionGroups.paramsList[elem]) {
            const text = /wizardConstant_/.test(elem)
              ? el.paramValues[elem]
              : questionGroups.paramsList[elem].description || elem;

            title[index] = (
              <span className="question-params" key={index}>
                {text}
              </span>
            );
          }
        }
        return { ...question, title };
      });

    return (
      <div key={'ou-' + el.id} className="question-group-content">
        <div className="question-group-title">
          {ouName} {questionGroups.id !== 'gid' ? og.name : ''}
        </div>
        <QuestionsList
          el={el}
          data={questionGroups}
          mainQuestions={mainQuestions}
          onQuestionOrderChange={onQuestionOrderChange}
          onQuestionSelect={onQuestionSelect}
        />
        {hiddenQuestions.length ? (
          <>
            <div className="question-group-title-type2">Добавить другие вопросы</div>
            <OtherQuestions
              key="question-add-new"
              onClick={(i) => onQuestionSelect({ questionId: i, uiId: el.id })}
              items={hiddenQuestions}
              nameKey="title"
            />
          </>
        ) : (
          ''
        )}
      </div>
    );
  });
};
