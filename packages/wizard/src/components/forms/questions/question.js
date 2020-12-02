import React, { useEffect, useCallback } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actions } from '../../../actions';
import { getCurrentOg, getQuestions, currentTarget, currentFormInfo } from '../../../reselect';
import { Header } from '../header';
import { QuestionsContainer } from './questions_container';

function WizardQuestionContainer({ fetchQuestionGroup, target, og, questions, parent, selectQuestion, reorderQuestion }) {
  useEffect(() => {
    fetchQuestionGroup(target);
  }, [target]);

  const memoizedReorderQuestion = useCallback(
    (payload) => {
      reorderQuestion({ ...payload, target });
    },
    [target]
  );
  const memoizedQuestionSelect = useCallback(
    (payload) => {
      selectQuestion({ ...payload, target });
    },
    [target]
  );

  if (!questions) {
    return null;
  }

  return (
    <>
      <Header title={`Формулировка вопроса ${parent ? `(${parent.text})` : ''}`} />
      <div className="question-group">
        <div className="question-group-block">
          <QuestionsContainer
            onQuestionOrderChange={memoizedReorderQuestion}
            onQuestionSelect={memoizedQuestionSelect}
            og={og}
            questionGroups={questions}
          />
        </div>
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    formInfo: currentFormInfo(state),
    og: getCurrentOg(state),
    target: currentTarget(state),
    questions: getQuestions(state),
  };
};

// Добавляем actions к this.props
const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(WizardQuestionContainer);
