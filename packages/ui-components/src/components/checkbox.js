import React, { useEffect } from 'react';
import { uuid } from '../../util/uuid';
import '../../styles/ui-components/checkbox.sass';

export default function Checkbox({ data, value = '', name, onChange, onFocus, onBlur }) {
  useEffect(() => {
    if (value === '') {
      onChange({ target: { value: data['false'] || false, name } });
    }
  }, []);

  const onToggle = (e) => {
    const checked = e.target.checked;
    onChange({ target: { value: data[checked.toString()] || checked, name } });
  };

  /* id для кликабельного лейбла чекбокса  */
  const checkboxId = uuid();

  return (
    <div className="checkbox">
      <input
        id={checkboxId}
        type="checkbox"
        checked={value === data.true}
        onChange={onToggle}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <label htmlFor={checkboxId}>{data.description}</label>
    </div>
  );
}
