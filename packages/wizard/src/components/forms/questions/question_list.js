import React from 'react';
import Icon from '@mdi/react';
import { mdiWindowClose } from '@mdi/js';

import { Hint } from '../../elements';

export const QuestionsList = React.memo(({ mainQuestions, el, data, onQuestionOrderChange, onQuestionSelect }) => {
  return (
    <div className="question-group-body">
      {mainQuestions.map(({ selected, question }, i) => {
        const upButton = i !== 0 && (
          <span
            className="icon-sort icon-sort-up"
            onClick={() => onQuestionOrderChange({ questionId: question.id, uiId: el.id, up: true })}
          />
        );
        const downButton = i !== mainQuestions.length - 1 && (
          <span
            className="icon-sort icon-sort-down"
            onClick={() => onQuestionOrderChange({ questionId: question.id, uiId: el.id, up: false })}
          />
        );
        const title = question.title.split('#');

        for (const [index, elem] of title.entries()) {
          if (data.paramsList[elem]) {
            const text = /wizardConstant_/.test(elem) ? el.paramValues[elem] : data.paramsList[elem].description || elem;

            title[index] = (
              <span className="question-params" key={index}>
                {text}
              </span>
            );
          }
        }

        return (
          <div className="question-group-item" key={el.id + '-q-' + question.id}>
            <div className="sort-buttons">
              {upButton}
              {downButton}
            </div>
            <div
              key={question.id}
              className="question-title"
              style={{
                textDecoration: selected ? 'none' : 'line-through',
              }}
            >
              №{++i}. {title}
              {question && question.hint && <Hint text={question.hint} />}
            </div>
            <Icon
              className="icon-close icon-close-group"
              path={mdiWindowClose}
              onClick={() => onQuestionSelect({ questionId: question.id, uiId: el.id })}
            />
          </div>
        );
      })}
    </div>
  );
});
