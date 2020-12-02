import React, { useState, useEffect, useMemo } from 'react';

const toRealValue = (selected, multiple) => {
  if (multiple) {
    return selected;
  } else {
    return selected[0] || 0;
  }
};

export default function Select({
  data,
  onChange,
  value = [],
  name,
  onFocus,
  onBlur,
  className = 'wizard-element-select-wrapper',
}) {
  const [selected, setSelected] = useState([]);
  // изначальные значения, в остальном value нам не нужен
  useEffect(() => {
    let val = Array.isArray(value) ? value : [value];
    if (!val.length || !val[0]) {
      val = [data.options[0]];
      onChange({
        target: {
          name,
          value: data.multiple ? [data.options[0]] : data.options[0],
        },
      });
    }
    const selected = data.options
      .map((o, index) => {
        const isObject = typeof o === 'object';
        const found = val.findIndex((v) => {
          if (isObject) {
            return v.value === o.value;
          } else {
            return v === o;
          }
        });
        return found !== -1 ? index : -1;
      })
      .filter((o) => o !== -1);
    setSelected(new Set(selected));
  }, []);

  const onOptionSelect = (e) => {
    const newSelected = Array.from(e.target.options)
      .filter((o) => o.selected)
      .map((o) => o.value);

    setSelected(newSelected);

    const newVal = newSelected.map((index) => data.options[index]);
    onChange({
      target: {
        name,
        value: data.multiple ? newVal : newVal[0],
      },
    });
  };

  const options = useMemo(
    () =>
      data.options.map((item, index) => {
        const text = typeof item === 'object' ? item.name : item;

        return (
          <option value={index} key={index}>
            {text}
          </option>
        );
      }),
    [data.options]
  );

  const realValue = toRealValue(selected, data.multiple);
  return (
    <div className={className}>
      <select
        className={data.size && data.size > 1 ? 'wizard-element-select auto_height' : 'wizard-element-select'}
        multiple={data.multiple}
        size={data.size}
        name={name}
        disabled={data.options.length < 2}
        onChange={onOptionSelect}
        onFocus={onFocus}
        onBlur={onBlur}
        value={realValue}
      >
        {options}
      </select>
    </div>
  );
}
