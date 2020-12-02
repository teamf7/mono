import React from 'react';
import { Header } from '../header';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions } from '../../../actions';
import { getKmList, getKm } from '../../../reselect';
import Select from '../../elements/select';
import Button from '../../elements/button';
import '../../../styles/directive.sass';

function DirectiveKmSelect({ kms, selectedKm, setKm, goToKmCreation }) {
  const kmsOptions = { options: kms };

  return (
    <>
      <Header title="Редактирование проекта директивы" stepCounter={{ current: 1, last: 5 }} />
      <div className="directive">
        <div className="directive__row">
          <label className="directive__label">Выберите КМ для рассмотрения вопроса</label>
          <Select
            value={selectedKm?.id}
            className={'wizard-element-select-wrapper select-wrapper-directive'}
            data={kmsOptions}
            onChange={(e) => setKm(e.target.value)}
          />
        </div>
        <div className="directive__row directive__row_inline">
          <label className="directive__label">или создайте новое</label>
          <Button onClick={goToKmCreation} className="button-wide" type="add" iconPosition={'left'} value="Создать" />
        </div>
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    kms: getKmList(state),
    selectedKm: getKm(state),
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(DirectiveKmSelect);
