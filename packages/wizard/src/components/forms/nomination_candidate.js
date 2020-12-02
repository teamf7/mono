import React from 'react';
import { Header } from './header';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions } from '../../actions';
import { getCurrentCandidate } from '../../reselect';

function CandidateDetail({ info }) {
  if (!info) {
    return <div />;
  }
  return (
    <div>
      <div>{info.fio}</div>
      <div>{info.position}</div>
      <div>{info.email}</div>
      <div>{info.phone}</div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    info: getCurrentCandidate(state),
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(CandidateDetail);
