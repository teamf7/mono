import React from 'react';
import { Hint } from '../elements';
import Filters from '../../util/filters';
import clone from 'clone';
import { getRefValue, resolveConditionArray } from '../../util/util';

/**
 * Собирает текст вопроса, встраивая в него компоненты ввода в соответствии
 * с указанными в тесте метками и переданными параметрами.
 *
 * @param textReturn - в случае положительного значения переменной,
 * компонент вернет не объкт реакта, а кусок текста. (Нужно для
 * формирования текста вопроса для передачи на сервер)
 */
export function WizardQuestionText({ text, values, paramsList, highlightedField, textReturn = false, isTitle = false }) {
  const result = [];
  if (!text) {
    return [];
  }
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
          const ignore = !resolveConditionArray(paramsList[subText].deps, paramsList, values);

          if (!ignore) {
            if (textReturn) {
              trueValue = WizardQuestionText({
                text: paramsList[subText].value,
                values: values,
                paramsList: paramsList,
                textReturn: true,
              });
            } else {
              trueValue = (
                <WizardQuestionText
                  text={paramsList[subText].value}
                  values={values}
                  paramsList={paramsList}
                  textReturn={false}
                />
              );
            }

            if (textReturn) {
              trueValue = trueValue.join(' ');
            }
          } else {
            trueValue = ' ';
          }
          break;
        case 'ref':
          trueValue = getRefValue(subText, paramsList, values);
          break;
        case 'datalist':
          trueValue = typeof values[subText] === 'object' ? values[subText][paramsList[subText].key] : values[subText];
          break;
        case 'select':
        case 'multiselect':
          const selectVal = Array.isArray(values[subText]) ? values[subText] : [values[subText]];
          trueValue = selectVal
            .map((v) => {
              let text;
              if (typeof v === 'object') {
                if (v.value && v.value.type === 'ref') {
                  text = getRefValue(v.value, paramsList, values);
                } else {
                  text = v.name;
                }
              } else {
                text = v;
              }
              return WizardQuestionText({ text, values, paramsList, textReturn: true }).join('');
            })
            .join(', ');
          break;

        case 'checkbox': 
        case 'checkbox-og': {
          const val = values[subText];
          if (typeof val === 'object') {
            if (val.type === 'ref') {
              trueValue = getRefValue(val, paramsList, values);
            } else {
              trueValue = val[paramsList[subText].key];
            }
          } else {
            trueValue = val;
          }
          break;
        }
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
            const regex = /#value.([a-zA-Z0-9._]+)#/;
            let prop;
            while ((prop = regex.exec(template)) !== null) {
              // вытаскиваем значение параметра из объекта, работает с вложенными объектами
              const value = prop[1].split('.').reduce((obj, key) => (obj && obj[key]) || '', values[subText][index]);
              template = template.replace(prop[0], value);
            }
            const value = typeof v === 'object' ? v[paramsList[subText].key] : v;
            template = template.replace('#value#', value);
            return !textReturn ? (
              <li className="question-list-item" key={subText + index}>
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
          // Lord forgive for our sins
          if (isTitle) {
            trueValue = values[subText]
              ? values[subText].reduce((acc, val, idx) => {
                  let title, source;
                  if (val.default === -1) {
                    title = paramsList[subText].list.generic.title;
                    source = paramsList[subText].list.generic;
                  } else {
                    title = paramsList[subText].list.default[val.default].title;
                    source = paramsList[subText].list.default[val.default];
                  }
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
                    const text = (
                        <WizardQuestionText
                            key={val.default + '-' + idx}
                            text={title}
                            values={Object.assign({}, val.paramValues, parentValues)}
                            paramsList={Object.assign({}, source.source, parentParams)}
                        />
                    );
                    acc.push(text);
                    if (idx !== values[subText].length - 1) {
                      acc.push(', ');
                    }
                    return acc;
                  }else{
                    const text = WizardQuestionText({
                      text: title,
                      values: Object.assign({}, val.paramValues, parentValues),
                      paramsList: Object.assign({}, source.source, parentParams),
                      textReturn: true,
                    });
                    acc.push(text);
                    if (idx !== values[subText].length - 1) {
                      acc.push(', ');
                    }
                    return acc;
                  }

                }, [])
              : '';
            break;
          }
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
                  if (paramsList[subText].display === 'comma') {
                    return value;
                  }
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

                  if (paramsList[subText].display === 'comma') {
                    return value;
                  }
                  if (values.length > 1) {
                    return '<li>' + value.join(' ') + '</li>';
                  } else {
                    return '<div>' + value.join(' ') + '</div>';
                  }
                }
              })
            : '';
          if (list) {
            if (paramsList[subText].display === 'comma') {
              for (let i = 1; i <= list.length - 1; i += 2) {
                list.splice(i, 0, ', ');
              }
              trueValue = list;
              break;
            }
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
            if(typeof time === 'string'){
              return time;
            }
            if (paramsList[subText].mode === 'year') {
              return time.getFullYear();
            }
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
