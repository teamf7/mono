import React, { useEffect, useMemo, useRef } from 'react';
import Input from './input';
import Select from './select';
import { fetchJson, getRefValue } from '../../util/util';
import debounce from 'p-debounce';

function getUnitText(num, unit, url, showNumText = false, textCase = 'nominative') {
  return fetchJson(url + `&num=${num}&unit=${unit.code}&case=${textCase}&num_text=${showNumText ? 'Y' : 'N'}`)
    .then((json) => {
      if (!json.success) {
        return `${num} ${unit.name}`;
      }
      return json.unit_found ? json.text : `${json.text} ${unit.name}`;
    })
    .catch((e) => `${num} ${unit.name}`);
}

const debouncedGetUnitText = debounce((valueRef, unit, onChange, data, name) => {
  getUnitText(valueRef.current.num, unit, data.url, data.showNumText, data.case).then((text) => {
      onChange({
        target: {
          value: { ...valueRef.current, text },
          name,
        },
      });
  });
}, 300);

export default function UnitNumber({ value, data, onChange, name, params, paramsValues }) {
  const valueRef = useRef(null);
  valueRef.current = value;
  const options = useMemo(
    () =>
      data.units.options.map((o) => {
        if (o.type !== 'ref') {
          return o;
        }
        return getRefValue(o, params, paramsValues);
      }),
    [data.units.options, params, paramsValues]
  );

  const defaultUnit = useMemo(() => (data.units.default ? options.find((o) => o.code === data.units.default) : options[0]), [
    data.units.default,
    options,
  ]);

  useEffect(() => {
    if (!value) {
      const num = data.value || '0';
      getUnitText(num, defaultUnit, data.url, data.showNumText, data.case).then((text) => {
        onChange({
          target: { value: { num, unit: defaultUnit.code, text }, name },
        });
      });
    }
  }, []);

  if (!value) {
    return <div />;
  }

  const onSetNumber = (e) => {
    onChange({
      target: {
        value: { ...value, num: e.target.value },
        name,
      },
    });
    if (e.target.value === '') {
      return;
    }
    const unit = options.find((o) => o.code === value.unit);
    debouncedGetUnitText(valueRef, unit, onChange, data, name);
  };

  const setUnit = (e) => {
    const unit = options.find((o) => o.code === e.target.value.value);
    onChange({
      target: {
        value: { ...value, unit: unit.code },
        name,
      },
    });
    getUnitText(value.num, unit, data.url, data.showNumText, data.case).then((text) => {
      onChange({
        target: {
          value: { ...value, text },
          name,
        },
      });
    });
  };

  const selectData = {
    options: options.map((o) => {
      return { value: o.code, name: o.name };
    }),
  };
  return (
    <>
      <Input value={value.num} type="number" onChange={onSetNumber} name={name + '-num'} />
      {!data.hideUnit && <Select data={selectData} value={value.unit} onChange={setUnit} name={name + '-unit'} />}
    </>
  );
}
