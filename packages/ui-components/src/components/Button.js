import React from 'react';

import { mdiArrowRight, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';

export default function Button({
  disabled,
  onClick,
  selected,
  value,
  type,
  iconPosition = 'right',
  className = 'wizard-element-button',
}) {
  const iconType = (buttonType) => {
    switch (buttonType) {
      case 'button-follow':
        return <Icon className="icon-arrow-right" path={mdiArrowRight} />;
      case 'add':
        return <Icon className="icon-add" path={mdiPlus} />;
      default:
        return '';
    }
  };

  return (
    <button disabled={disabled} className={className + (selected ? ' selected' : '')} onClick={onClick}>
      {iconPosition === 'right' ? (
        <>
          {value}
          {iconType(type)}
        </>
      ) : (
        <>
          {iconType(type)}
          {value}
        </>
      )}
    </button>
  );
}
