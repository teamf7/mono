import React from 'react';
import { WizardQuestionParamList, WizardQuestionText } from '../../elements';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions } from '../../../actions';
import { dealSubjectSelector } from '../../../reselect';
import { propTypes } from 'react-bootstrap/esm/Image';

const titleParams = {
  subject: {
    type: 'input',
  },
};

function WizardDealSubject({ subject, setDealSubjectParam, og }) {
  const onParamUpdate = ({ target: { name, value } }) => {
    setDealSubjectParam({ param: name, value });
  };

  const textValuesFromParamsHandler = (obj) => {
    if (obj.volume) {
      const textArr = obj.volume.text.split(' ');
      textArr[0] = Number(textArr[0]).toLocaleString('ru');

      const volume = {
        ...obj.volume,
        text: textArr.join(' '),
        num: obj.volume.num.toLocaleString('ru'),
      };

      return {
        ...obj,
        volume,
      };
    } else {
      return obj;
    }
  };

  const textValuesHandler = (obj) => {
    const { obligations, obligationsRUB, obligationsUSD, sum, sumRUB, sumTotal, sumUSD } = obj.wizardConstant_data;

    const wizardConstant_data = {
      ...obj.wizardConstant_data,
      obligations: Number(obligations).toLocaleString('ru'),
      obligationsRUB: Number(obligationsRUB).toLocaleString('ru'),
      obligationsUSD: Number(obligationsUSD).toLocaleString('ru'),
      sum: Number(sum).toLocaleString('ru'),
      sumRUB: Number(sumRUB).toLocaleString('ru'),
      sumTotal: Number(sumTotal).toLocaleString('ru'),
      sumUSD: Number(sumUSD).toLocaleString('ru'),
    };

    return {
      ...obj,
      wizardConstant_data,
    };
  };

  return (
    <>
      <div className="form-title">Условия сделки</div>
      <div className="question-group-title">
        <WizardQuestionText text={subject.title} paramsList={subject.params} values={subject.paramValues} isTitle={true} />
      </div>
      <div className="question-content">
        <div className="question-text-wrapper">
          <WizardQuestionText text={subject.text} paramsList={subject.params} values={textValuesHandler(subject.paramValues)} />
        </div>
        <div className="question-params-list">
          <WizardQuestionParamList
            onChange={onParamUpdate}
            data={subject.params}
            values={textValuesFromParamsHandler(subject.paramValues)}
            paramsList={Object.keys(subject.params)}
            og={og}
          />
        </div>
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    subject: dealSubjectSelector(state),
  };
};

// Добавляем actions к this.props
const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(WizardDealSubject);
