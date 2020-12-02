import React, { useCallback } from 'react';

import { Button } from './elements';

export function WizardNavBar({
  dispatch,
  navbarInfo,
  pageInfo,
  isDisabledSavePage,
  isShowSaveButton,
  isDisabledEndPage,
  isDisabledStartPage,
  actions: { nextStep, prevStep, save },
}) {
  const memoizedNextStep = useCallback(() => {
    nextStep({
      type: pageInfo.nextStep,
      isFunc: pageInfo.isFunc,
      func: pageInfo.func,
      isNext: pageInfo.isNext,
      validation: pageInfo.validation,
      nextButton: true,
    });
  }, [pageInfo]);

  const memoizedPrevStep = useCallback(() => {
    prevStep({
      type: pageInfo.nextStep,
      isFunc: pageInfo.isFunc,
      func: pageInfo.func,
      isPrev: pageInfo.isPrev,
      prevButton: true,
    });
  }, [pageInfo]);

  const memoizedSave = useCallback(() => {
    save({
      type: pageInfo.nextStep,
      isFunc: pageInfo.isFunc,
      func: pageInfo.func,
      isPrev: pageInfo.isPrev,
      prevButton: true,
    });
  }, [pageInfo]);
  // навигация по истории
  return (
   // <div className="navButtons" style={(!isShowSaveButton && { justifyContent: 'flex-end' }) || null}>
    <div className={`navButtons${isShowSaveButton ? '' : ' navButtons-right'}`}>
      {isShowSaveButton && (
        <Button
          onClick={memoizedSave}
          value="Сохранить"
          type="button-simple"
          className={`button button-simple ${isDisabledSavePage ? 'disabled' : ''}`}
        />
      )}
      <div>
        <Button
          onClick={memoizedPrevStep}
          disabled={isDisabledStartPage}
          value={navbarInfo.backName}
          type="button-simple"
          className={`button button-simple ${isDisabledStartPage ? 'disabled' : ''}`}
        />
        {navbarInfo.additionalButtons.map((button) => (
          <Button
            key={button.name}
            onClick={() => dispatch(button.action)}
            value={button.name}
            type="button-simple"
            className={`button`}
          />
        ))}
        <Button
          onClick={memoizedNextStep}
          disabled={isDisabledEndPage}
          value={navbarInfo.nextName}
          type="button-follow"
          className={`button button-follow ${isDisabledEndPage ? 'disabled' : ''}`}
        />
      </div>
    </div>
  );
}
