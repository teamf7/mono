import React from 'react';
import { Header } from './header';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actions } from '../../actions';
import { getNominationOptions, getNominationOg, getNominationOu } from '../../reselect';

export function Nomination({ options, og, ou, setNominationOg, setNominationOu }) {
  const ogOptions = options.map((o) => (
    <option value={o.ID} key={o.ID}>
      {o.UF_SNAME}
    </option>
  ));
  const onOgChange = (e) => setNominationOg(parseInt(e.target.value));
  const onOuChange = (e) => setNominationOu(e.target.value);
  return (
    <>
      <Header title="Выдвижение" />
      <div className="form-buttons">
        <select value={og || ''} onChange={onOgChange}>
          <option value="">Не выбрано</option>
          {ogOptions}
        </select>
        <select value={ou} onChange={onOuChange}>
          <option value="RK">Ревизионная комиссия</option>
          <option value="SD">Совет директоров</option>
        </select>
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    options: getNominationOptions(state),
    og: getNominationOg(state),
    ou: getNominationOu(state),
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Nomination);
