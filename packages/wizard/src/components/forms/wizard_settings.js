import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { actions } from '../../actions';
import { formsSelector, getCurrentOg } from '../../reselect';
import { Header } from './header';
import server from '../../util/server';
import { Datalist } from '../elements';

const ogProp = {
  type: 'datalist',
  key: 'name',
  url: server + '/API/internal/v1/get_org.php?',
};

function WizardSettings({ title, setOg, og, ogList }) {
  const ogSelect = useMemo(() => {
    if (ogList) {
      return (
        <Datalist
          data={{
            type: 'datalist',
            key: 'name',
            options: ogList,
          }}
          value={og}
          onChange={(e) => setOg(e.target.value)}
          name="og"
        />
      );
    } else {
      return <Datalist data={ogProp} value={og} onChange={(e) => setOg(e.target.value)} name="og" />;
    }
  }, [ogList, og]);

  return (
    <>
      <Header title={title} />
      <div className="form-buttons">
        <div className="form-item">
          <label className="form-label">Наименование ОГ</label>
          <div className="wizard-element-select-wrapper">{ogSelect}</div>
        </div>
        <div className="form-item">
          <label className="form-label">Инициатор ИП</label>
          <div className="prop-text">{og?.initiator?.name}</div>
        </div>
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    og: getCurrentOg(state),
    ogList: formsSelector(state).ogList,
  };
};

// Добавляем actions к this.props
const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(WizardSettings);
