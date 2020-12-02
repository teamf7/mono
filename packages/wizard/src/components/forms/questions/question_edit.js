import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actions } from '../../../actions';
import {
  getQuestions,
  currentTarget,
  getCurrentOg,
  getCurrentOu,
  getMainQuestions,
  linkedQuestions,
  hiddenQuestions
} from '../../../reselect';
import { Header } from '../header';
import { QuestionNavBar } from './question_navbar';
import { QuestionGroup } from './question_group';

function QuestionEdit({
  title,
  questions,
  og,
  target,
  ou,
  mainQuestions,
  linkedQuestions,
  hiddenQuestions,
  toggleLinked,
  changeQuestionParamValues,
  nextStep,
  voteUpdate
}) {
  if (!questions.id) {
    return null;
  }

  return (<>
    <Header title={title} />
    <div className="question-navbar-block">
      <QuestionNavBar
        ou={questions.ou}
        ouList={questions.managementDepartment}
        target={target}
        onClick={nextStep}
      />
    </div>
    <QuestionGroup
      questions={questions}
      target={target}
      og={og}
      ou={ou}
      mainQuestions={mainQuestions}
      linkedQuestions={linkedQuestions}
      hiddenQuestions={hiddenQuestions}
      toggleLinked={toggleLinked}
      voteUpdate={voteUpdate}
      changeQuestionParamValues={changeQuestionParamValues}
    />

  </>);
}

const mapStateToProps = state => {
  return {
    target: currentTarget(state),
    questions: getQuestions(state),
    og: getCurrentOg(state),
    ou: getCurrentOu(state),
    mainQuestions: getMainQuestions(state),
    linkedQuestions: linkedQuestions(state),
    hiddenQuestions: hiddenQuestions(state)
  };
};

// Добавляем actions к this.props
const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(QuestionEdit);
