import React from 'react';
import '../../../styles/deal.sass';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions } from '../../../actions';
import { getDealJustification } from '../../../reselect';
import { TextareaAutosize } from '@material-ui/core';

const params = {
  extra: 'Дополнительная информация',
  goal: 'Сделка совершается в целях',
  contractorChoice: 'Порядок выбора контрагента',
  priceFormation: 'Порядок ценообразования',
  buying: 'Информация о планируемых/проведенных закупочных процедурах',
};

function WizardDealJustification({ justification, setDealJustification }) {
  return (
    <>
      <div className="form-title">Условия сделки</div>
      <div className="deal">
        {Object.entries(params).map(([param, name]) => (
          <div className="deal__row" key={param}>
            <div className="deal__item">
              <div className="deal__label">{name}</div>
              <TextareaAutosize
                className="deal__input"
                aria-label="empty textarea"
                value={justification[param]}
                onChange={(e) => setDealJustification({ name: param, value: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    justification: getDealJustification(state),
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(WizardDealJustification);
