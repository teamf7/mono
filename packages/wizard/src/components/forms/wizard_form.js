import React, { useEffect, useCallback } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actions } from '../../actions';
import { Button } from '../elements';
import { getCurrentOg, currentFormInfo } from '../../reselect';
import { Header } from './header';
import { useParams } from 'react-router-dom';

function WizardForm({ formInfo, fetchForms, nextStep, startDeal }) {
  const { type } = useParams();

  useEffect(() => {
    fetchForms(type);
  }, []);

  const step = useCallback(
    (id) => {
      const item = formInfo.items[id];
      if (item.target.type === 'deal_subject') {
        startDeal({ ...item, typical: true });
      } else {
        nextStep({ ...item.target, text: item.text, isButton: item.type === 'button' });
      }
    },
    [formInfo]
  );

  // простая форма с кнопками
  if (!formInfo) {
    return null;
  }
  return (
    <>
      <Header title={formInfo?.title} />
      <div className="form-buttons">
        {formInfo.items.map((elem, idx) => (
          <Button value={elem.text} key={`form-buttons-${elem.id}`} onClick={() => step(idx)} selected={!!elem.selected} />
        ))}
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    formInfo: currentFormInfo(state),
    og: getCurrentOg(state),
  };
};

// Добавляем actions к this.props
const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(WizardForm);
