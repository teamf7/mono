import React, { useEffect } from 'react';
import { fetchJson } from '../../util/util';
import { mdiWindowClose, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Datalist from './datalist';
import Input from './input';
import clone from 'clone';

export default function List({ data, og, value, name, onChange, onFocus, onBlur }) {
  // вытаскиваем дефолтные значения, если их нет
  if (typeof data.value !== 'undefined') {
    value = value ? value : data.value;
  }
  useEffect(() => {
    if (Array.isArray(value) || Array.isArray(data.value)) return;
    fetchJson(data.url + '&ogId=' + og.id).then((result) => {
      onChange({
        target: {
          name,
          value: result,
        },
      });
    });
  }, [og]);

  if (!value) {
    return '';
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

  const deletableFrom = data.list.default.length;
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
      <li className="param-list-item" key={name + index}>
        {input}
        {index >= deletableFrom ? (
          <Icon className="icon-close icon-close-list" path={mdiWindowClose} onClick={() => onItemDelete(index)} />
        ) : (
          ''
        )}
      </li>
    );
  });

  return (
    <ol className="param-list param-list-margin">
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
  );
}
