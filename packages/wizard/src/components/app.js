import React, { useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import { actions } from '../actions';
import { Container } from './container';
import { WizardNavBar } from './wizard_navbar';
import Preloader from './elements/preloader';
import {
  currentViewForm,
  isShowSaveButton,
  isDisabledSavePage,
  isDisabledEndPage,
  isDisabledStartPage,
  navbarInfo,
} from '../reselect';
import { preloaderState } from '../util/api';


const mapStateToProps = (state) => {
  return {
    navbarInfo: navbarInfo(state),
    currentViewForm: currentViewForm(state),
    isDisabledStartPage: isDisabledStartPage(state),
    isDisabledEndPage: isDisabledEndPage(state),
    isShowSaveButton: isShowSaveButton(state),
    isDisabledSavePage: isDisabledSavePage(state),
  };
};

// Добавляем actions к this.props
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch),
  dispatch
});

function App({
  isShowSaveButton,
  isDisabledSavePage,
  isDisabledStartPage,
  isDisabledEndPage,
  actions,
  dispatch,
  currentViewForm,
  navbarInfo,
}) {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    preloaderState().subscribe(setLoading);
    return preloaderState().unsubscribe();
  }, []);
  const { type, status, id, ogId, typeId } = useParams();
  useEffect(() => {
    actions.initialization({
      type,
      status,
      ogId,
      typeId,
      id,
    });
  }, [type, status, ogId, typeId, id]);

  return (
    <>
      <Preloader loading={loading} />
      <div className="wizard">
        <Container pageInfo={currentViewForm} />
        <WizardNavBar
          dispatch={dispatch}
          navbarInfo={navbarInfo}
          pageInfo={currentViewForm}
          isDisabledSavePage={isDisabledSavePage}
          isShowSaveButton={isShowSaveButton}
          isDisabledEndPage={isDisabledEndPage}
          isDisabledStartPage={isDisabledStartPage}
          actions={actions}
        />
      </div>
    </>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
