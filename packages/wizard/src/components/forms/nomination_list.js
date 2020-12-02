import React from 'react';
import { Header } from './header';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions } from '../../actions';
import { getNominationCandidates, getNominationOuName, getNominationOgName } from '../../reselect';
import CandidateDetail from './nomination_candidate';
import { Datalist } from '../elements';
import server from '../../util/server';

const searchProp = {
  type: 'datalist',
  key: 'UF_NOMINATIVE',
  url: server + '/API/internal/v1/padej.php?',
};
function NominationList({
  options,
  ogName,
  ouName,
  toggleNominationCandidate,
  showNominationCandidate,
  addNominationCandidate,
}) {
  const onCandidateAdd = ({ target: { value } }) => {
    addNominationCandidate(value);
  };

  const list = options
    .slice()
    .sort((a, b) => !a.selected - !b.selected)
    .map((option, idx) => {
      const onToggle = () => toggleNominationCandidate(option.id);
      const showCandidate = () => showNominationCandidate(option.id);
      return (
        <tr className="table__row" key={option.id} style={{ textDecoration: option.selected ? 'none' : 'line-through  ' }}>
          <td onClick={showCandidate}>{option.name}</td>
          <td onClick={showCandidate}>{option.position}</td>
          <td>
            <input type="checkbox" checked={option.selected} onChange={onToggle} />
          </td>
        </tr>
      );
    });

  return (
    <>
      <Header title="Выбор кандидатов" />
      <div style={{ width: '990px', padding: '20px' }}>
        <div>
          {ouName} {ogName}
        </div>
        <Datalist data={searchProp} onChange={onCandidateAdd} name="candidate" />
        <br />
        <br />
        <div className="table-wrapper">
          {list.length ? (
            <table className="table">
              <tbody className="table__body">{list}</tbody>
            </table>
          ) : (
            <div>Кандидатов нет</div>
          )}

          <div>
            <CandidateDetail />
          </div>
        </div>
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    options: getNominationCandidates(state),
    ogName: getNominationOgName(state),
    ouName: getNominationOuName(state),
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(NominationList);
