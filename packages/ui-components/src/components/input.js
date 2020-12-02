import React, { useState, useEffect } from 'react';
import NumberFormat from 'react-number-format';

export default function Input({
  value,
  defaultValue,
  type = 'text',
  name,
  onChange,
  onFocus,
  onBlur,
  className = 'wizard-element-input',
  disabled,
  placeholder = '',
}) {
  const valueOnFocusHandler = (event) => {
    if (type === 'number' && value === '0') {
      onChange({ target: { value: '', name } });
    }
    onFocus && onFocus(event);
  };

  const valueOnBlurHandler = (event) => {
    if (type === 'number' && value === '') {
      onChange({ target: { value: '0', name } });
    }
    onBlur && onBlur(event);
  };

  if (type === 'number') {
    return (
      <NumberFormat
        defaultValue={defaultValue}
        value={value}
        thousandSeparator={' '}
        decimalSeparator={','}
        displayType={'input'}
        onValueChange={(values) => {
          if (values.value != value) {
            onChange({ target: { value: values.floatValue, name } });
          }
        }}
        decimalScale={2}
        name={name}
        fieldtype={type}
        className={className}
        disabled={disabled ? 'disabled' : ''}
        onFocus={valueOnFocusHandler}
        onBlur={valueOnBlurHandler}
        placeholder="0"
      />
    );
  } else {
    return (
      <input
        defaultValue={defaultValue}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={valueOnFocusHandler}
        onBlur={valueOnBlurHandler}
        fieldtype={type}
        className={className}
        autoComplete="off"
        disabled={disabled ? 'disabled' : ''}
        placeholder={placeholder}
      />
    );
  }
}
