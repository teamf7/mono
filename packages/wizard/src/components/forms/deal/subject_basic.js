import React from 'react';
import '../../../styles/deal.sass';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions } from '../../../actions';
import { getDealSubjectBasic } from '../../../reselect';
import { TextareaAutosize } from '@material-ui/core';

function WizardDealSubjectBasic({ subject, setDealSubjectBasicType, setDealSubjectBasicText }) {
  return (
    <>
      <div className="form-title">Условия сделки</div>
      <div className="deal">
        <div className="deal__row">
          <div className="deal__item">
            <div className="deal__label">Вид сделки</div>
            <TextareaAutosize
              className="deal__input"
              aria-label="empty textarea"
              value={subject.type}
              onChange={(e) => setDealSubjectBasicType(e.target.value)}
            />
          </div>
        </div>
        <div className="deal__row">
          <div className="deal__item">
            <div className="deal__label">Предмет сделки</div>
            <TextareaAutosize
              className="deal__input"
              aria-label="empty textarea"
              value={subject.text}
              onChange={(e) => setDealSubjectBasicText(e.target.value)}
            />
          </div>
        </div>
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    subject: getDealSubjectBasic(state),
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(WizardDealSubjectBasic);
