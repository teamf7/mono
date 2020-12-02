import React, { useMemo } from 'react';
import server from '../../util/server';
import { Datalist } from '../elements';

export default function WizardElementOrgSelect({ data, value, name, onChange, onFocus, onBlur }) {
  const onOgToggle = (e) => {
    onChange({
      target: { name, value: { name: '', isOg: e.target.checked } },
    });
  };

  const orgProp = useMemo(() => {
    return {
      type: 'datalist',
      key: 'name',
      url: server + '/API/internal/v1/get_org.php?' + (!value.isOg ? '&ksk=Y' : '') + '&' + data.urlParams,
      ...data.datalistParams,
    };
  }, [value.isOg, data.urlParams, data.datalistParams]);

  return (
    <>
      {!data.hideOgToggle && (
        <div className="deal__row deal__row_label">
          <div className="deal__item side-item">
            <input
              id={`isOg-${data.urlParams}`}
              type="checkbox"
              checked={value.isOg}
              disabled={data.lockOg}
              name="og"
              onChange={onOgToggle}
            />
            <label htmlFor={`isOg-${data.urlParams}`}>Общество группы</label>
          </div>
        </div>
      )}
      <div className="deal__row">
        <div className="deal__item">
          <label className="deal__label">Организация</label>
          <Datalist data={orgProp} value={value} onChange={onChange} name={name} onFocus={onFocus} onBlur={onBlur} />
        </div>
      </div>
    </>
  );
}
