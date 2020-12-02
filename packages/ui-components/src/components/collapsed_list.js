import React, { useEffect, useState, useRef } from 'react';
import { fetchJson } from '../../util/util';
import { mdiWindowClose, mdiPlus, mdiArrowLeft, mdiChevronRight } from '@mdi/js';
import Icon from '@mdi/react';
import Datalist from './datalist';
import Input from './input';
import clone from 'clone';

export default function CollapsedList(props) {
  const [showSelection, setShowSelection] = useState(false);
  // вытаскиваем дефолтные значения, если их нет
  useEffect(() => {
    if (Array.isArray(props.value)) return;
    fetchJson(props.data.url + '&ogId=' + props.og.id)
      .then((result) => {
        props.onChange({
          target: {
            name: props.name,
            value: result,
          },
        });
      });
  }, []);

  if (showSelection) {
    return <CollapsedListEdit {...props} onReturn={() => setShowSelection(false)} />;
  } else {
    return <CollapsedCustomListEdit {...props} onSelection={() => setShowSelection(true)} />;
  }
}

function CollapsedListEdit({ data, value, name, onChange, onReturn, onFocus, onBlur, og }) {
  if (typeof data.value !== 'undefined') {
    value = value ? value : data.value;
  }

  if (!value) {
    return <div />;
  }

  const onItemChange = (e, index) => {
    const target = { name };
    target.value = value.slice();
    target.value.splice(index, 1, e.target.value);
    onChange({ target });
  };

  const onItemAdd = () => {
    onChange({
      target: {
        name,
        value: [...value, ''],
      },
    });
  };

  const onItemDelete = (index) => {
    const target = { name };
    target.value = value.slice();
    target.value.splice(index, 1);
    onChange({ target });
  };

  const deletableFrom = data.list.default.length - 1;
  const items = value.map((value, index) => {
    let input;
    switch (data.source.type) {
      case 'input':
        input = <Input name={name + index} value={value} onChange={(e) => onItemChange(e, index)} />;
        break;
      case 'datalist':
        const inputData = clone(data.source);
        inputData.key = data.key;
        input = (
          <Datalist
            name={name + index}
            parentId={name}
            data={inputData}
            value={value || ''}
            onChange={(e) => onItemChange(e, index)}
            onFocus={onFocus}
            onBlur={onBlur}
            og={og}
            type="list"
          />
        );
    }
    return (
      <li className="param-list-item param-list-item-custom" key={name + index}>
        <span className="counter-list">{index + 1}</span>
        <div className="prop-row">
          <label className="prop-name">{!index ? 'ФИО (Председатель Правления)' : 'ФИО'}</label>
          <div className="prop-value">
            {input}

            {index >= deletableFrom ? (
              <Icon className="icon-close icon-close-list" path={mdiWindowClose} onClick={() => onItemDelete(index)} />
            ) : (
              ''
            )}
          </div>
        </div>
      </li>
    );
  });

  return (
    <div>
      <div className="navigation-small">
        <button className="button-back" onClick={onReturn}>
          <Icon path={mdiArrowLeft} className="icon-back" />
          Назад
        </button>
        <button className="button-ok" onClick={onReturn}>
          ОК
        </button>
      </div>
      <div className="param-custom">
        <div className="button-dropdown-type2">
          {data.description} <span className="grey-dot">{value.length}</span>
        </div>
      </div>
      <ol className="param-list">
        {items}
        {data.list.generic ? (
          <button className="button-add" onClick={onItemAdd}>
            <Icon className="icon-add" path={mdiPlus} />
            Добавить
          </button>
        ) : (
          ''
        )}
      </ol>
    </div>
  );
}

function CollapsedCustomListEdit({ data, value, onSelection }) {
  const valueRef = useRef();
  valueRef.current = value;

  return (
    <div className="param-custom">
      {data.elementSelect !== 'none' ? (
        <button className="button-dropdown-type2" onClick={onSelection}>
          {data.description}
          <Icon path={mdiChevronRight} className="icon" />
        </button>
      ) : (
        ''
      )}
    </div>
  );
}
