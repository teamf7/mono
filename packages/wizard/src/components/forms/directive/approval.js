import React from 'react';
import { Header } from '../header';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions } from '../../../actions';
import { getDirectiveApprovers, getDirectiveRatifiers } from '../../../reselect';
import { Datalist } from '../../elements';
import server from '../../../util/server';
import Icon from '@mdi/react';
import { mdiCloseThick } from '@mdi/js';

const Approver = ({ name, title, onRemove }) => (
  <div className="directive-question__row">
    <div className="directive-question__vote">{title}</div>
    <div>{name}</div>
    {onRemove && <Icon onClick={onRemove} className="icon-delete" path={mdiCloseThick} />}
  </div>
);

const approverProp = {
  type: 'datalist',
  key: 'name',
  url: server + '/API/internal/v1/get_approver.php?',
};

function DirectiveApproval({ approvers, ratifiers, addDirectiveApprover, removeDirectiveApprover }) {
  return (
    <>
      <Header title="Формирование директивы" stepCounter={{ current: 5, last: 5 }} />
      <div className="directive-wide">
        <div className="directive__row">
          <div className="directive__title">Формирование листа согласования директивы:</div>
        </div>
        <div className="directive__row">
          <div className="directive-question__block">
            <label className="directive__label directive__label_question">Согласование директивы</label>
            <div>
              {approvers.map((a, idx) => (
                <Approver key={a.id} name={a.name} title={a.position} onRemove={() => removeDirectiveApprover(idx)} />
              ))}
              <div className="directive-question__row">
                <div className="directive-question__vote">Добавить согласующего</div>
                <div style={{ width: '500px' }}>
                  <Datalist data={approverProp} onChange={(e) => addDirectiveApprover(e.target.value)} name="approver" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="directive__row">
          <div className="directive-question__block">
            <label className="directive__label directive__label_question">Утверждение директивы</label>
            <div>
              {ratifiers.map((r) => (
                <Approver key={r.id} name={r.name} title={r.position} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    approvers: getDirectiveApprovers(state),
    ratifiers: getDirectiveRatifiers(state),
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(DirectiveApproval);
