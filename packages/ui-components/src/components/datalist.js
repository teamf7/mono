import React, { useMemo } from 'react';
import { fetchJson } from '../../util/util';
import AsyncSelect from 'react-select/async';
import { components } from 'react-select';
import '../../styles/ui-components/react-select.sass';

const arrayToOptions = (array, key) =>
  array.map((r) => {
    if (typeof r === 'string') {
      return { label: r, value: r };
    } else {
      const val = r[key];
      return {
        label: val,
        value: r,
      };
    }
  });

const MAX_LIST_LENGTH = 50;

const MenuList = (props) => {
  let shownChildren = props.children;
  let more = null;
  if (Array.isArray(props.children)) {
    shownChildren = shownChildren.slice(0, MAX_LIST_LENGTH);
    const diff = props.children.length - shownChildren.length;
    if (diff) {
      more = <div className="react-select-menu-hint">Показано {MAX_LIST_LENGTH}. Уточните запрос.</div>;
    }
  }

  return (
    <>
      <components.MenuList {...props} className={more ? 'has-hint' : ''}>
        {shownChildren}
      </components.MenuList>
      {more}
    </>
  );
};

const ClearIndicator = (props) => {
  const {
    children = <components.CrossIcon />,
    getStyles,
    getValue,
    innerProps: { ref, ...restInnerProps },
  } = props;

  if (!getValue()[0]?.label) {
    return null;
  }

  return (
    <div {...restInnerProps} ref={ref} style={getStyles('clearIndicator', props)}>
      <div style={{ height: '20px', width: '20px' }}>{children}</div>
    </div>
  );
};

export default function WizardElementDatalist({ data, value, name, onChange, onFocus, onBlur, og, disabled }) {
  const defaultOptions = useMemo(() => {
    if (data.options?.length) {
      return arrayToOptions(data.options, data.key);
    }
    return [];
  }, [data.options, data.key]);

  const url = useMemo(() => data.url + (og?.id ? '&ogId=' + og.id : '') + '&q=', [og, data.url]);

  const onInputChange = (option) => {
    onChange({ target: { name, value: option?.value || '' } });
  };

  const getOptions = (query) => {
    if (data.url) {
      return fetchJson(url + encodeURIComponent(query), { hidePreloader: true }).then((result) =>
        arrayToOptions(result, data.key)
      );
    } else {
      return Promise.resolve(defaultOptions.filter((value) => value?.label?.toLowerCase().includes(query.toLowerCase())));
    }
  };

  const fullVal = value
    ? {
        label: typeof value === 'string' ? value : value[data.key],
        value: value,
      }
    : null;

  return (
    <AsyncSelect
      className="react-select-container"
      classNamePrefix="react-select"
      menuPortalTarget={document.body}
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
      onBlur={(e) => onBlur && onBlur(e)}
      onFocus={(e) => onFocus && onFocus(e)}
      isClearable={true}
      cacheOptions={url}
      defaultOptions={defaultOptions.length ? defaultOptions : true}
      loadOptions={getOptions}
      openMenuOnClick={false}
      onChange={onInputChange}
      noOptionsMessage={() => 'Нет доступных вариантов'}
      components={{ MenuList, ClearIndicator }}
      value={fullVal}
      placeholder={data.placeholder || 'Введите...'}
      isDisabled={disabled}
    />
  );
}
