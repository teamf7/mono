import React, { useState, useEffect } from 'react';
import { WizardQuestionText } from './question_text';

export default function MultiSelect({ data, onChange, value = [], name, params = {}, paramsValues = {} }) {
  const [selected, setSelected] = useState(new Set());

  // изначальные значения, в остальном value нам не нужен
  useEffect(() => {
    const selected = data.options
      .map((o, index) => {
        const isObject = typeof o === 'object';
        const val = Array.isArray(value) ? value : [value];
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

  const multiple = data.multiple !== false;

  const onOptionClick = (index) => {
    const newSelected = new Set(multiple ? selected : null);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelected(newSelected);
    const newVal = Array.from(newSelected).map((index) => data.options[index]);
    onChange({
      target: {
        name,
        value: multiple ? newVal : newVal[0],
      },
    });
  };

  const options = data.options.map((item, index) => {
    const isObject = typeof item === 'object';
    const className = selected.has(index) ? 'multiselect-option selected' : 'multiselect-option';
    const text = isObject ? item.name : item;

    return (
      <div className={className} key={index} onClick={() => onOptionClick(index)}>
        <WizardQuestionText text={text} values={paramsValues} paramsList={params} />
      </div>
    );
  });

  return <div className="wizard-element-select-wrapper">{options}</div>;
}
