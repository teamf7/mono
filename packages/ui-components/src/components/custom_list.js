import React, { useState, useEffect, useRef, useMemo } from 'react';
import { mdiWindowClose, mdiPlus, mdiChevronRight, mdiArrowLeft, mdiChevronDown, mdiChevronUp } from '@mdi/js';
import Icon from '@mdi/react';
import { WizardQuestionParamList } from './question_param_list';
import '../../styles/ui-components/collapser.sass';
import clone from 'clone';
import { WizardQuestionText } from './question_text';
import { resolveParamCondition, initParamValues } from '../../util/util';

function createListItem(params, index = -1, title = '') {
  const res = { paramValues: {}, default: index, title: title };
  initParamValues(res.paramValues, Object.keys(params), params)
  return res;
}

export default function CustomList(props) {
  const [showSelection, setShowSelection] = useState(false);
  // создаем дефолтные значения, если их нет
  useEffect(() => {
    if (Array.isArray(props.value) || props.data.elementSelect !== 'none') return;

    let val;
    if (props.data.list.default?.length) {
      val = props.data.list.default.map((d, index) => {
        return createListItem(d.source, index);
      });
    } else {
      val = [createListItem(props.data.list.generic.source)];
    }
    props.onChange({
      target: {
        name: props.name,
        value: val,
      },
    });
  }, []);

  if (showSelection) {
    return <CustomListSelect {...props} onReturn={() => setShowSelection(false)} />;
  } else {
    return <CustomListEdit {...props} onSelection={() => setShowSelection(true)} />;
  }
}

function CustomListEdit({ data, og, value, name, onChange, onSelection, params, paramsValues }) {
  const valueRef = useRef();
  valueRef.current = value;

  const onItemChange = (e, index) => {
    const target = { name };
    valueRef.current = target.value = valueRef.current.slice();
    target.value[index] = {
      ...target.value[index],
      paramValues: {
        ...target.value[index].paramValues,
        [e.target.name]: e.target.value,
      },
    };
    onChange({ target });
  };

  const onItemAdd = () => {
    onChange({
      target: {
        name,
        value: [...value, createListItem(data.list.generic.source)],
      },
    });
  };

  const onItemDelete = (index) => {
    const target = { name };
    target.value = value.slice();
    target.value.splice(index, 1);
    onChange({ target });
  };

  const paramsData = useMemo(() => {
    if (!value) {
      return;
    }
    return value.map((val, index) => {
      const original = val.default === -1 ? data.list.generic : data.list.default[val.default];
      const parentParams = {};
      for (const param in params) {
        const paramChild = clone(params[param]);
        if (paramChild.type === 'ref') {
          paramChild.source = 'parent.' + paramChild.source;
        }
        parentParams['parent.' + param] = paramChild;
      }
      const fullParams = Object.assign({}, original.source, parentParams);
      const parentValues = {};
      for (const param in paramsValues) {
        parentValues['parent.' + param] = paramsValues[param];
      }
      const fullValues = Object.assign({}, val.paramValues, parentValues);
      return {
        original,
        fullParams,
        paramsList: Object.keys(original.source),
        fullValues,
      };
    });
  }, [data.list, params, paramsValues, value]);

  const items = value
    ? value.map((value, index) => {
        const { fullParams, fullValues, paramsList, original } = paramsData[index];
        const title = <WizardQuestionText text={original.title} values={fullValues} paramsList={fullParams} />;
        return (
          <Collapser key={name + index} title={title}>
            <WizardQuestionParamList
              onChange={(e) => onItemChange(e, index)}
              data={fullParams}
              values={fullValues}
              paramsList={paramsList}
              og={og}
            />
            {value.default === -1 && (
              <Icon className="icon-close icon-close-list" path={mdiWindowClose} onClick={() => onItemDelete(index)} />
            )}
          </Collapser>
        );
      })
    : '';

  return (
    <div className="param-custom">
      {data.elementSelect !== 'none' && (
        <button className="button-dropdown" onClick={onSelection}>
          Изменить {data.description.toLowerCase()}
          <Icon path={mdiChevronRight} className="icon" />
        </button>
      )}
      {items}
      {data.list.generic && (
        <button className="button-add" onClick={onItemAdd}>
          <Icon className="icon-add" path={mdiPlus} />
          Добавить
        </button>
      )}
    </div>
  );
}

function CustomListSelect({ data, value, name, onChange, onReturn, params, paramsValues }) {
  const onSelect = (e) => {
    if (data.elementSelect === 'radio') {
      onChange({
        target: {
          name,
          value: [createListItem(data.list.default[e.target.value].source, parseInt(e.target.value), data.list.default[e.target.value].title)],
        },
      });
    } else {
      const newValue = value ? value.slice() : [];
      if (e.target.checked) {
        newValue.push(createListItem(data.list.default[e.target.value].source, parseInt(e.target.value), data.list.default[e.target.value].title));
        newValue.sort((a, b) => {
          if (a.default === -1) return 1;
          if (b.default === -1) return -1;
          return a.default - b.default;
        });
        onChange({
          target: {
            name,
            value: newValue,
          },
        });
      } else {
        const existing = value.findIndex((v) => v.default === parseInt(e.target.value));
        newValue.splice(existing, 1);
        onChange({
          target: {
            name,
            value: newValue,
          },
        });
      }
    }
  };

  const items = data.list.default.map((item, index) => {
    const checked = value ? value.findIndex((v) => v.default === index) !== -1 : false;

    const parentParams = {};
    for (const param in params) {
      const paramChild = clone(params[param]);
      if (paramChild.type === 'ref') {
        paramChild.source = 'parent.' + paramChild.source;
      }
      parentParams['parent.' + param] = paramChild;
    }
    const fullParams = Object.assign({}, item.source, parentParams);
    const parentValues = {};
    for (const param in paramsValues) {
      parentValues['parent.' + param] = paramsValues[param];
    }
    if(item.condition && !resolveParamCondition(item.condition, fullParams, parentValues)){
      return null;
    }
    const title = <WizardQuestionText text={item.title} values={parentValues} paramsList={fullParams} />;
    return (
      <li className="side-item" key={name + '-select-' + index}>
        <input
          id={name + '-select-' + index}
          type={data.elementSelect}
          name={name + '-selector'}
          value={index}
          checked={checked}
          onChange={onSelect}
        />
        <label htmlFor={name + '-select-' + index}>{title}</label>
      </li>
    );
  });

  return (
    <div className="subject-block">
      <div className="navigation-small">
        <button className="button-back" onClick={onReturn}>
          <Icon path={mdiArrowLeft} className="icon-back" />
          Назад
        </button>
        <button className="button-ok" onClick={onReturn}>
          ОК
        </button>
      </div>
      <div className="subject-side">
        <div className="side-title">{data.description}</div>
        <ul className="side-items">{items}</ul>
      </div>
    </div>
  );
}

/** Компонент, скрывающий содержащийся в нем контент по нажатию на его заголовок
 * @param title - текст заголовка
 * @param children - переданный контент
 */
function Collapser({ title, children }) {
  const [isOpened, onClickHandle] = useState(true);

  return (
    <div className="collapser">
      <div className="collapser__title" onClick={() => onClickHandle(!isOpened)}>
        {title}
        <Icon className="icon" path={isOpened ? mdiChevronDown : mdiChevronUp} />
      </div>
      <div className={`collapser__content ${isOpened ? '' : 'collapser__content_hidden'}`}>{children}</div>
    </div>
  );
}
