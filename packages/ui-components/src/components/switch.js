import React, { useEffect } from 'react';
import Select from 'react-select';

import '../../styles/ui-components/react-select.sass';

export default function Switch({ value, onChange, name, data }) {
  useEffect(() => {
    const val = data.items.map((i, index) => ({
      ...i,
      role: data.sides[index].name,
      roleCode: data.sides[index].code,
    }));
    onChange({
      target: { value: val, name },
    });
  }, []);

  if (!value) {
    return <div />;
  }

  const onSwitch = (target, to) => {
    const newVal = value.slice();
    const targetVal = value[target];
    const toVal = value[to];

    newVal.splice(to, 1, {
      ...targetVal,
      role: toVal.role,
      roleCode: toVal.roleCode,
    });
    newVal.splice(target, 1, {
      ...toVal,
      role: targetVal.role,
      roleCode: targetVal.roleCode,
    });

    onChange({
      target: { value: newVal, name },
    });
  };

  const sides = data.sides.map((s, index) => {
    const options = value.map((i, idx) => ({
      value: String(idx),
      label: i.name,
      isDisabled: index === idx,
    }));

    return (
      <div key={name + s.code + index} className="prop-row">
        <div className="prop-name">{s.name}</div>
        <div className="prop-value">
          <Select
            defaultValue={options[index]}
            value={options[index]}
            options={options}
            onChange={(option) => onSwitch(index, option.value)}
            className="react-select-container hidden-disabled-options"
            classNamePrefix="react-select"
            isDisabled={options.length <= 1}
          />
        </div>
      </div>
    );
  });

  return <div className="switch-block">{sides}</div>;
}
