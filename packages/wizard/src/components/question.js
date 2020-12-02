import React, { useContext, useState } from 'react';
import Icon from '@mdi/react';
import { mdiWindowClose } from '@mdi/js';
import {
  Hint,
  OtherQuestions,
  Datalist,
  Input,
  Select,
  List,
  CollapsedList,
  DatePicker,
  File,
  CustomList,
  UnitNumber,
  Switch,
  MultiSelect,
} from './elements';
import clone from 'clone';
import Filters from '../util/filters';
import { WizardContext } from './wizard';

export function reindexFiles(data) {
  const fileIndex = {};
  let index = 1;
  for (const ou of data.ou) {
    for (const q of ou.questions) {
      if (q.position === 'hidden' || (q.position === 'alone' && !q.selected)) continue;
      for (const param of q.question.params) {
        if (data.paramsList[param].type === 'file' && !fileIndex.hasOwnProperty(param)) {
          fileIndex[param] = index++;
        }
      }
    }
  }
  const newParamsList = { ...data.paramsList };
  for (const param in fileIndex) {
    newParamsList[param] = {
      ...newParamsList[param],
      description: `Приложение ${fileIndex[param]}`,
    };
  }
  return newParamsList;
}

export function WizardQuestionList({ data, onDataReady, parent }) {
  const { og } = useContext(WizardContext);
  // Добавляем вопросов в выбранные
  const onQuestionSelect = (questionId, ouId) => {
    const newData = clone(data);
    const question = newData.ou.find((o) => o.id === ouId).questions.find((q) => q.question.id === questionId);
    // если добавляем не alone
    if (question.selected) {
      question.selected = false;
      question.position = 'hidden';
      question.parentId = '';
    } else {
      question.selected = true;
      question.position = 'alone';
      question.parentId = '';
    }
    newData.paramsList = reindexFiles(newData);
    onDataReady(newData);
  };

  const onQuestionOrderChange = (questionId, ouId, up) => {
    const newData = clone(data);
    const ou = newData.ou.find((o) => o.id === ouId);
    const questionIndex = ou.questions.findIndex((q) => q.question.id === questionId);
    const target = ou.questions.findIndex(
      (val, index) => (up ? index < questionIndex : index > questionIndex) && val.position === 'alone'
    );
    const temp = ou.questions[target];
    ou.questions[target] = ou.questions[questionIndex];
    ou.questions[questionIndex] = temp;
    onDataReady(newData);
  };

  const ouBlock = data.ou.map((ou) => {
    const mainQuestions = ou.questions.filter((i) => i.position === 'alone');
    const questions = mainQuestions.map(({ selected, question }, i) => {
      const upButton =
        i !== 0 ? (
          <span className="icon-sort icon-sort-up" onClick={() => onQuestionOrderChange(question.id, ou.id, true)} />
        ) : (
          ''
        );
      const downButton =
        i !== mainQuestions.length - 1 ? (
          <span className="icon-sort icon-sort-down" onClick={() => onQuestionOrderChange(question.id, ou.id, false)} />
        ) : (
          ''
        );
      const title = question.title.split('#');
      for (const [index, elem] of title.entries()) {
        if (data.paramsList[elem]) {
          title[index] = (
            <span className="question-params" key={index}>
              {data.paramsList[elem].description || elem}
            </span>
          );
        }
      }

      return (
        <div className="question-group-item" key={ou.id + '-q-' + question.id}>
          <div className="sort-buttons">
            {upButton}
            {downButton}
          </div>
          <div
            key={question.id}
            className="question-title"
            style={{
              textDecoration: selected ? 'none' : 'line-through',
            }}
          >
            №{++i}. {title}
            {question && question.hint ? <Hint text={question.hint} /> : ''}
          </div>
          <Icon
            className="icon-close icon-close-group"
            path={mdiWindowClose}
            onClick={() => onQuestionSelect(question.id, ou.id)}
          />
        </div>
      );
    });

    const hiddenQuestions = ou.questions
      .filter((i) => i.position === 'hidden' || i.position === 'linked')
      .map(({ question }) => {
        const title = question.title.split('#');
        for (const [index, elem] of title.entries()) {
          if (data.paramsList[elem]) {
            title[index] = (
              <span className="question-params" key={index}>
                {data.paramsList[elem].description || elem}
              </span>
            );
          }
        }
        return { ...question, title };
      });

    const ouName = data.managementDepartment.find((o) => o.id === ou.id).name;

    return (
      <div key={'ou-' + ou.id} className="question-group-content">
        <div className="question-group-title">
          {ouName} {data.id !== 'gid' ? og.name : ''}
        </div>
        <div className="question-group-body">{questions}</div>
        {hiddenQuestions.length ? (
          <>
            <div className="question-group-title-type2">Добавить другие вопросы</div>
            <OtherQuestions
              key="question-add-new"
              onClick={(i) => onQuestionSelect(i, ou.id)}
              items={hiddenQuestions}
              nameKey="title"
            />{' '}
          </>
        ) : (
          ''
        )}
      </div>
    );
  });

  return (
    <>
      <div className="form-title">Формулировка вопроса {parent ? `(${parent.text})` : ''}</div>
      <div className="question-group">
        <div className="question-group-block">{ouBlock}</div>
      </div>
    </>
  );
}

export function WizardQuestionEdit({ data, onDataReady, target, newStep, parent }) {
  const { og } = useContext(WizardContext);

  /** выделение изменяемого поля */
  const [highlightedField, setHighlightedField] = useState(null);

  // обработка изменения значения поля
  const questionPropChange = (e) => {
    const questionData = clone(data);
    const values = questionData.ou.find((o) => o.id === target.ou).paramValues;
    values[e.target.name] = e.target.value;
    onDataReady(questionData);
  };

  /** установить подсветку изменяемого параметра */
  const questionPropsFocus = (e) => {
    setHighlightedField(e.target.name);
  };

  /** снять подсветку изменяемого параметра */
  const questionPropsLostFocus = () => {
    setHighlightedField(null);
  };

  // переключаем вопрос из связанного и обратно
  const toggleLinked = (ouId, mainQuestionId, linkedQuestionId) => {
    const newData = clone(data);
    const linked = newData.ou.find((o) => o.id === ouId).questions.find((q) => q.question.id === linkedQuestionId);

    if (linked.position === 'linked') {
      if (linked.parentId === mainQuestionId) {
        linked.position = 'hidden';
        linked.parentId = null;
      } else {
        linked.parentId = mainQuestionId;
      }
    } else {
      linked.position = 'linked';
      linked.parentId = mainQuestionId;
    }
    newData.paramsList = reindexFiles(newData);
    onDataReady(newData);
  };

  const ou = data.ou.find((o) => o.id === target.ou);
  const mainQuestions = ou.questions.filter((q) => q.selected).map((q) => q.question);
  const hiddenQuestions = ou.questions.filter((q) => q.position !== 'linked' && !q.selected).map((q) => q.question);
  const linkedQuestions = ou.questions
    .filter((q) => q.position === 'linked' && q.parentId === mainQuestions[target.step].id)
    .map((q) => q.question);

  let textBlock;
  let paramsList = [];

  if (!linkedQuestions.length) {
    textBlock = (
      <div className="question-text">
        <WizardQuestionText
          text={mainQuestions[target.step].text}
          paramsList={data.paramsList}
          values={ou.paramValues}
          highlightedField={highlightedField}
        />
      </div>
    );
    paramsList = mainQuestions[target.step].params;
  } else {
    const questions = [mainQuestions[target.step], ...linkedQuestions];
    textBlock = questions.map((q, i) => {
      for (const param of q.params) {
        if (paramsList.indexOf(param) === -1) {
          paramsList.push(param);
        }
      }
      const deleteBtn = i ? (
        <Icon
          className="icon-close icon-close-questions"
          path={mdiWindowClose}
          onClick={() => toggleLinked(ou.id, mainQuestions[target.step].id, q.id)}
        />
      ) : (
        ''
      );
      return (
        <div className="question-text" key={'qText-' + q.id}>
          {deleteBtn} {i + 1}.
          <WizardQuestionText
            text={q.text}
            paramsList={data.paramsList}
            values={ou.paramValues}
            highlightedField={highlightedField}
          />
        </div>
      );
    });
  }
  const otherQuestions = hiddenQuestions.map((question) => {
    const title = question.title.split('#');
    for (const [index, elem] of title.entries()) {
      if (data.paramsList[elem]) {
        title[index] = (
          <span className="question-params" key={index}>
            {data.paramsList[elem].description || elem}
          </span>
        );
      }
    }
    return { ...question, title };
  });

  const ouName = data.managementDepartment.find((o) => o.id === ou.id).name;
  let voting;
  if (!og.isRea) {
    const onVoteUpdate = (v) => {
      mainQuestions[target.step].voteResult = mainQuestions[target.step].voteResult === v ? '' : v;
      const questionData = clone(data);
      onDataReady(questionData);
    };
    const result = mainQuestions[target.step].voteResult;
    voting = (
      <div className="question-editor-title-vote">
        <div className="form-label">Голосование</div>
        <div className="voting">
          <button className={'vote-button' + (result === 'Y' ? ' vote-button-favour' : '')} onClick={() => onVoteUpdate('Y')}>
            За
          </button>
          <button className={'vote-button' + (result === 'N' ? ' vote-button-against' : '')} onClick={() => onVoteUpdate('N')}>
            Против
          </button>
          <button
            className={'vote-button' + (result === 'A' ? ' vote-button-abstained' : '')}
            onClick={() => onVoteUpdate('A')}
          >
            Воздержался
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="form-title">Формулировки вопросов и проекты решений {parent ? `(${parent.text})` : ''}</div>
      <div className="question-navbar-block">
        <QuestionNavBar ou={data.ou} ouList={data.managementDepartment} target={target} newStep={newStep} />
      </div>
      <div className="question-group-title">
        {ouName} {data.id !== 'gid' ? og.name : ''}
      </div>
      <div className="question-editor-title">
        <div className="question-editor-title-block">
          <span>Вопрос №{target.step + 1}</span>
          <br />
          <WizardQuestionText text={mainQuestions[target.step].title} paramsList={data.paramsList} values={ou.paramValues} />
        </div>
        {voting}
      </div>
      <div className="question-content">
        <div className="question-text-wrapper">
          {textBlock}
          <div className="question-group-title-type2">Добавить пункт проекта решения</div>
          <OtherQuestions
            key="question-add-linked"
            onClick={(i) => toggleLinked(ou.id, mainQuestions[target.step].id, i)}
            items={otherQuestions}
            nameKey="title"
          />
        </div>
        <div className="question-params-list">
          <WizardQuestionParamList
            onChange={questionPropChange}
            onFocus={questionPropsFocus}
            onBlur={questionPropsLostFocus}
            data={data.paramsList}
            values={ou.paramValues}
            paramsList={paramsList}
          />
        </div>
      </div>
    </>
  );
}

export function WizardQuestionParamList({ values, paramsList, data, onChange, onFocus, onBlur }) {
  const result = [];
  for (let paramName of paramsList) {
    if (data[paramName].condition) {
      const { source, key, op, value } = data[paramName].condition;
      let show = false;
      const sourceVal = getRefValue(
        {
          type: 'ref',
          source,
          key,
        },
        values
      );
      switch (op) {
        case '=':
          show = sourceVal == value;
          break;
        case '>=':
          show = sourceVal >= value;
          break;
        case '<=':
          show = sourceVal <= value;
          break;
        case '>':
          show = sourceVal > value;
          break;
        case '<':
          show = sourceVal < value;
          break;
      }
      if (!show) {
        continue;
      }
    }
    let prop = '';

    switch (data[paramName].type) {
      case 'input':
        prop = (
          <Input
            key={paramName}
            value={values[paramName]}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            name={paramName}
          />
        );
        break;
      case 'numberUnit':
        prop = (
          <UnitNumber key={paramName} value={values[paramName]} data={data[paramName]} onChange={onChange} name={paramName} />
        );
        break;
      case 'date':
        prop = (
          <DatePicker
            key={paramName}
            value={values[paramName]}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            name={paramName}
          />
        );
        break;
      case 'select':
        prop = (
          <Select
            key={paramName}
            data={data[paramName]}
            value={values[paramName]}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            name={paramName}
          />
        );
        break;

      case 'multiselect':
        prop = (
          <MultiSelect key={paramName} data={data[paramName]} value={values[paramName]} onChange={onChange} name={paramName} />
        );
        break;
      case 'datalist':
        prop = (
          <Datalist
            data={data[paramName]}
            value={values[paramName]}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            name={paramName}
          />
        );
        break;
      case 'switch':
        prop = (
          <Switch
            data={data[paramName]}
            value={values[paramName]}
            onChange={onChange}
            name={paramName}
            outSides={data[paramName + '.sides'] ? data[paramName + '.sides'] : false}
          />
        );
        break;
      case 'ol':
      case 'ul':
        prop = (
          <List
            data={data[paramName]}
            value={values[paramName]}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            name={paramName}
          />
        );
        break;
      case 'ol-custom':
      case 'ul-custom':
        prop = <CustomList data={data[paramName]} value={values[paramName]} onChange={onChange} name={paramName} />;
        break;
      case 'ol-collapsed':
      case 'ul-collapsed':
        prop = (
          <CollapsedList
            data={data[paramName]}
            value={values[paramName]}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            name={paramName}
          />
        );
        break;
      case 'file':
        prop = <File data={data[paramName]} value={values[paramName]} onChange={onChange} name={paramName} />;
        break;
      default:
        continue;
    }
    result.push(
      <div key={paramName + 'prop-row'} className={'prop-row ' + paramName}>
        {data[paramName].description ? <div className="prop-name">{data[paramName].description}</div> : ''}
        <div className="prop-value">{prop}</div>
      </div>
    );
  }
  return result;
}

const getRefValue = (param, values) => {
  const source = values[param.source];

  if (typeof source === 'object') {
    return param.key.split('.').reduce((obj, key) => (obj && obj[key]) || '', source);
  } else {
    return source;
  }
};
/**
 * Собирает текст вопроса, встраивая в него компоненты ввода в соответствии
 * с указанными в тесте метками и переданными параметрами.
 *
 * @param textReturn - в случае положительного значения переменной,
 * компонент вернет не объкт реакта, а кусок текста. (Нужно для
 * формирования текста вопроса для передачи на сервер)
 */

export function WizardQuestionText({ text, values, paramsList, highlightedField, textReturn = false }) {
  const result = [];

  const textArray = text.split('#');
  let key = 0,
    key1 = 0;

  for (let subText of textArray) {
    // проверяем, является ли фрагмент текста ключем для объекта параметров
    if (typeof paramsList[subText] !== 'undefined') {
      let trueValue;
      switch (paramsList[subText].type) {
        case 'hint':
          if (textReturn) {
            trueValue = `(${paramsList[subText].value})`;
          } else {
            trueValue = <Hint text={paramsList[subText].value} />;
          }
          break;
        case 'subtextCondition':
          let ignore = false;
          for (const param of paramsList[subText].deps) {
            if (!paramsList[param]) {
              ignore = true;
              break;
            }
            const val = paramsList[param].type === 'ref' ? getRefValue(paramsList[param], values) : values[param];
            if (!val || (Array.isArray(val) && !val.length)) {
              ignore = true;
              break;
            }
          }

          if (!ignore) {
            if (!textReturn) {
              trueValue = <WizardQuestionText text={paramsList[subText].value} values={values} paramsList={paramsList} />;
            } else {
              trueValue = WizardQuestionText({
                text: paramsList[subText].value,
                values: values,
                paramsList: paramsList,
                textReturn: true,
              });
            }
            if (textReturn) {
              trueValue = trueValue.join(' ');
            }
          } else {
            trueValue = ' ';
          }
          break;
        case 'ref':
          trueValue = getRefValue(paramsList[subText], values);
          break;
        case 'datalist':
          trueValue = typeof values[subText] === 'object' ? values[subText][paramsList[subText].key] : values[subText];
          break;
        case 'select':
        case 'multiselect':
          const selectVal = Array.isArray(values[subText]) ? values[subText] : [values[subText]];
          trueValue = selectVal
            .map((v) => {
              if (typeof v === 'object') {
                if (v.value && v.value.type === 'ref') {
                  return getRefValue(v.value, values);
                } else {
                  return v.name;
                }
              } else {
                return v;
              }
            })
            .join(', ');
          break;
        case 'ul':
        case 'ol':
        case 'ul-collapsed':
        case 'ol-collapsed':
          if (!values[subText]) {
            trueValue = '';
            break;
          }
          const items = values[subText].map((v, index) => {
            let template;
            if (index >= paramsList[subText].list.default.length) {
              template = paramsList[subText].list.generic.text;
            } else {
              template = paramsList[subText].list.default[index].text;
            }
            // находим метки параметров в шаблоне
            const regex = /#value.([a-zA-Z0-9._]+)#/g;
            let prop;
            while ((prop = regex.exec(template)) !== null) {
              // вытаскиваем значение параметра из объекта, работает с вложенными объектами
              const value = prop[1].split('.').reduce((obj, key) => (obj && obj[key]) || '', values[subText][index]);
              template = template.replace(prop[0], value);
            }
            const value = typeof v === 'object' ? v[paramsList[subText].key] : v;
            template = template.replace('#value#', value);

            return !textReturn ? (
              <li
                className={`question-list-item${highlightedField === value ? ' question-prop-text-highlighted' : ''}`}
                key={subText + index}
              >
                {template}
              </li>
            ) : (
              '<li>' + template + '</li>'
            );
          });
          if (!textReturn) {
            trueValue =
              paramsList[subText].type === 'ol' ? (
                <ol className="question-list">{items}</ol>
              ) : (
                <ul className="question-list question-list-ul">{items}</ul>
              );
          } else {
            trueValue =
              paramsList[subText].type === 'ol' ? '<ol >' + items.join(' ') + '</ol>' : '<ul>' + items.join(' ') + '</ul>';
          }
          break;
        case 'ul-custom':
        case 'ol-custom':
          const list = values[subText]
            ? values[subText].map((v, index) => {
                const source =
                  v.default === -1 ? paramsList[subText].list.generic : paramsList[subText].list.default[v.default];
                const parentParams = {};
                for (const param in paramsList) {
                  const paramChild = clone(paramsList[param]);
                  if (paramChild.type === 'ref') {
                    paramChild.source = 'parent.' + paramChild.source;
                  }
                  parentParams['parent.' + param] = paramChild;
                }
                const parentValues = {};
                for (const param in values) {
                  parentValues['parent.' + param] = values[param];
                }
                if (!textReturn) {
                  const value = (
                    <WizardQuestionText
                      text={source.text}
                      values={Object.assign({}, v.paramValues, parentValues)}
                      paramsList={Object.assign({}, source.source, parentParams)}
                    />
                  );
                  if (values[subText].length > 1) {
                    return (
                      <li className="question-list-ul-item" key={subText + index}>
                        {value}
                      </li>
                    );
                  } else {
                    return (
                      <div className="question-list-ul-item" key={subText + index}>
                        {value}
                      </div>
                    );
                  }
                } else {
                  const value = WizardQuestionText({
                    text: source.text,
                    values: Object.assign({}, v.paramValues, parentValues),
                    paramsList: Object.assign({}, source.source, parentParams),
                    textReturn: true,
                  });
                  if (values.length > 1) {
                    return '<li>' + value.join(' ') + '</li>';
                  } else {
                    return '<div>' + value.join(' ') + '</div>';
                  }
                }
              })
            : '';
          if (list) {
            if (!textReturn) {
              if (list.length > 1) {
                trueValue =
                  paramsList[subText].type === 'ol-custom' ? (
                    <ol className="question-list">{list}</ol>
                  ) : (
                    <ul className="question-list question-list-ul">{list}</ul>
                  );
              } else {
                trueValue =
                  paramsList[subText].type === 'ol-custom' ? (
                    <div className="question-list">{list}</div>
                  ) : (
                    <div className="question-list question-list-ul">{list}</div>
                  );
              }
            } else {
              if (list.length > 1) {
                trueValue =
                  paramsList[subText].type === 'ol-custom'
                    ? '<ol>' + list.join(' ') + '</ol>'
                    : '<ul>' + list.join(' ') + '</ul>';
              } else {
                trueValue =
                  paramsList[subText].type === 'ol-custom'
                    ? '<div>' + list.join(' ') + '</div>'
                    : '<div>' + list.join(' ') + '</div>';
              }
            }
          }
          break;
        case 'file':
          trueValue = paramsList[subText].description;
          break;
        case 'date':
          const formatDate = (time) => {
            let result = [];
            result = ['0' + time.getDate(), '0' + (time.getMonth() + 1)].map((component) => component.slice(-2));
            return result.join('.') + '.' + time.getFullYear();
          };
          trueValue = values[subText] ? formatDate(values[subText]) : '';
          break;
        case 'numberUnit':
          trueValue = values[subText] ? values[subText].text : '';
          break;
        case 'elementCount':
          let count = parseInt(paramsList[subText].value);
          for (const param of paramsList[subText].sumFieldName) {
            count += Array.isArray(values[param]) ? values[param].length : parseInt(values[param]);
          }
          trueValue = count;
          break;
        default:
          trueValue = values[subText];
          break;
      }

      if (paramsList[subText].displayFilter) {
        trueValue = Filters[paramsList[subText].displayFilter](trueValue);
      }
      if (!textReturn) {
        let focusedParam;
        if (subText.split('.')[1] === 'FullName') {
          focusedParam = 'CEO.FullName';
        } else {
          focusedParam = subText;
        }
        result.push(
          <span
            key={subText + key++}
            className={`question-prop-text ${highlightedField === focusedParam ? 'question-prop-text-highlighted' : ''}`}
            title={paramsList[subText].description ? paramsList[subText].description : subText}
          >
            {trueValue ? trueValue : paramsList[subText].description}
          </span>
        );
      } else {
        result.push(trueValue ? trueValue : paramsList[subText].description);
      }
    } else {
      if (!textReturn) {
        result.push(<span key={'tt' + key1++} dangerouslySetInnerHTML={{ __html: subText }} />);
      } else {
        result.push(subText);
      }
    }
  }
  return result;
}

function QuestionNavBar({ ou, ouList, target, newStep }) {
  const ouName = ouList.find((o) => o.id === target.ou).name;

  return ou.map((ou) => {
    const selected = ou.questions.filter((q) => q.selected);
    if (!selected.length) {
      return null;
    }
    const buttons = selected.map((q, index) => (
      <div
        key={'qNavBar-' + index + '-' + ou.id}
        onClick={() =>
          newStep({
            ...target,
            ou: ou.id,
            step: index,
          })
        }
        className={`question-navbar-item ${target.ou === ou.id && target.step === index ? 'question-navbar-item-current' : ''}`}
      >
        <span className="question-navbar-count">{index + 1}</span>
      </div>
    ));
    return (
      <div key={'qNavBar-' + ou.id} className="question-navbar-block-item">
        <div className="form-label">{ouName}</div>
        <div className={`question-navbar ${buttons.length > 4 ? 'question-navbar-wide' : ''}`}>{buttons}</div>
      </div>
    );
  });
}
