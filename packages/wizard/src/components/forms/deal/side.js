import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions } from '../../../actions';
import { currentTarget, dealSidesSelector, currentSideNum, availableRolesSelector, getDealTypical } from '../../../reselect';
import { Header } from '../header';
import WizardDealSideDetail from './side_detail';

export function WizardDealSide({
  target,
  typical,
  sides,
  availableRoles,
  setDealSideParam,
  setDealSide,
  addDealSide,
  removeDealSide,
}) {
  return (
    <>
      <Header title={`Создание сделки: ${target.header}`} />
      <div className="deal__side">
        {sides.map((side, currentSide) => (
          <WizardDealSideDetail
            key={`${side.role}-${currentSide}`}
            showBsaBlock={currentSide < 2}
            side={side}
            canRemove={!(typical || !currentSide)}
            remove={() =>
              window.confirm(
                'Удаление стороны №' +
                  (currentSide + 1) +
                  ' может привести к потере заполненных данных, а также к смещению нумерции последующих сторон, вы подтверждаете удаление?'
              ) && removeDealSide(currentSide)
            }
            currentSide={currentSide}
            availableRoles={availableRoles}
            setDealSideParam={setDealSideParam}
            setDealSide={setDealSide}
          />
        ))}
        {!typical && (
          <div className="deal__form" onClick={addDealSide}>
            +<br />
            Добавить сторону сделки
          </div>
        )}
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    target: currentTarget(state),
    typical: getDealTypical(state),
    sides: dealSidesSelector(state),
    currentSide: currentSideNum(state),
    availableRoles: availableRolesSelector(state),
  };
};

// Добавляем actions к this.props
const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(WizardDealSide);
