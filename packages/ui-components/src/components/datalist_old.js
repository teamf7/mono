import React, { useContext, useRef, useMemo } from 'react';
import { fetchJson } from '../../util/util';
import SelectSearch from 'react-select-search';
import '../../styles/select-search.css';

const arrayToOptions = (array, options, key) =>
  array.map((r) => {
    if (typeof r === 'string') {
      options.set(r, r);
      return { name: r, value: r };
    } else {
      const val = r[key];
      options.set(val, r);
      return {
        name: val,
        value: val,
      };
    }
  });
export default function WizardElementDatalist({ data, value, name, onChange, onFocus, onBlur, type = 'datalist', og }) {
  const options = useRef(new Map());

  const defaultOptions = useMemo(() => {
    if (data.options && data.options.length) {
      return arrayToOptions(data.options, options.current, data.key);
    } else if (value) {
      const val = typeof value === 'string' ? value : value[data.key];
      return [{ name: val, value: val }];
    } else {
      return [];
    }
  }, [data, value]);

  const onInputChange = (value) => {
    const res = { target: { name } };
    if (value && options.current.has(value)) {
      res.target.value = options.current.get(value);
      onChange(res);
    }
  };

  const getOptions = (query) => {
    if (query?.length > 2 && data.url) {
      const url = data.url + (og?.id ? '&ogId=' + og.id : '') + '&q=' + encodeURIComponent(query);

      return fetchJson(url).then((result) => arrayToOptions(result, options.current, data.key));
    } else {
      return Promise.resolve(defaultOptions);
    }
  };

  // Если value не указано - сбрасывать его каждый ререндер
  const realVal = value === undefined ? Math.random().toString() : typeof value === 'object' ? value[data.key] : value;

  return (
    <SelectSearch
      options={defaultOptions}
      search={true}
      value={realVal}
      renderValue={(valueProps) => {
        const onFocusHandle = (e) => {
          valueProps.onFocus(e);
          onFocus && onFocus(e);
        };
        const onBlurHandle = (e) => {
          valueProps.onBlur(e);
          onBlur && onBlur(e);
        };
        return (
          <div className="prop-value">
            <input
              className="wizard-element-input"
              value={realVal}
              name={type === 'list' ? realVal : name}
              {...valueProps}
              onFocus={onFocusHandle}
              onBlur={onBlurHandle}
              autoComplete="off"
              fieldtype={type}
            />
          </div>
        );
      }}
      onChange={onInputChange}
      getOptions={getOptions}
    />
  );
}
