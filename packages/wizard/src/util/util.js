import { WizardQuestionText } from '../components/elements';

export { fetchJson } from './api';

export const isDebug = window.location.search
  .substr(1)
  .split('&')
  .reduce((res, get) => {
    const [param, val] = get.split('=');
    if (param === 'debug' && val === 'on') res = true;
    return res;
  }, false);

export const isDeal = window.location.search
  .substr(1)
  .split('&')
  .reduce((res, get) => {
    const [param, val] = get.split('=');
    if (param === 'type' && val === 'DEAL') res = true;
    return res;
  }, false);

const fileNameCases = {
  GENITIVE: 'Приложения',
  DATIVE: 'Приложению',
  ACCUSATIVE: 'Приложение',
  INSTRUMENTAL: 'Приложением',
  PREPOSITIONAL: 'Приложении',
}

export function reindexFiles(data) {
  const fileIndex = {};
  let index = 1;
  for (const ou of data.ou) {
    for (const q of ou.questions) {
      if (q.position === 'hidden' || (q.position === 'alone' && !q.selected)) continue;
      if (q?.question?.params !== null) {
        for (const param of q.question.params) {
          if (data.paramsList[param].type === 'file') {
            if (!fileIndex.hasOwnProperty(param)) {
              fileIndex[param] = { index: index++, ouId: [ou.id] };
            } else {
              fileIndex[param].ouId.push(ou.id);
            }
          }
        }
      }
    }
  }
  const newParamsList = { ...data.paramsList };
  for (const param in fileIndex) {
    newParamsList[param] = {
      ...newParamsList[param],
      description: `Приложение ${fileIndex[param].index}`,
      _fIndex: fileIndex[param].index
    };
    for(const [c, name] of Object.entries(fileNameCases)){
      newParamsList[param + '.' + c] = {
        description: `${name} ${fileIndex[param].index}`,
      };
    }
  }
  newParamsList['__files'] = fileIndex;

  return newParamsList;
}
export const initParamValues = (values, params, paramsList) => {
  for (const param of params) {
    if (paramsList[param].hasOwnProperty('value')) {
      if (paramsList[param].type === 'date') {
        if (paramsList[param].value === 'lastYear') {
          values[param] = new Date();
          values[param].setFullYear(values[param].getFullYear() - 1);
        } else if (paramsList[param].value === 'current') {
          values[param] = new Date();
        } else {
          values[param] = new Date(paramsList[param].value);
        }
      } else {
        values[param] = paramsList[param].value;
      }
    } else {
      values[param] = '';
    }
  }
};

export const prepareQuestionJson = (data, og, additionalValues = {}) => {
  let additionalProps = [];
  if (og) {
    additionalProps = [
      {
        name: 'wizardConstant_OGName',
        data: {
          type: 'input',
          value: og.name,
        },
      },
      {
        name: 'wizardConstant_IsKeyOG',
        data: {
          type: 'input',
          value: og.isKey,
        },
      },
      {
        name: 'wizardConstant_OSName',
        data: {
          type: 'input',
          value: og.os,
        },
      },
    ];
    for (const prop of additionalProps) {
      data.paramsList[prop.name] = prop.data;
    }
  }
  data.ou = [];
  if (data.questionList) {
    for (const question of data.questionList) {
      if (!question.sort) question.sort = 1;
    }
    data.questionList.sort((a, b) => a.sort - b.sort);

    for (const question of data.questionList) {
      if (isDebug) {
        question.title = `${question.title} ID: ${question.id}`;
      }
      for (const ou of question.managementDepartment) {
        let ouObj = data.ou.find((o) => o.id === ou);
        if (!ouObj) {
          ouObj = {
            questions: [],
            paramValues: {},
            id: ou,
          };
          data.ou.push(ouObj);
        }
        ouObj.questions.push({
          position: question.position,
          parentId: question.parentId,
          selected: question.position === 'alone',
          question,
        });
        initParamValues(ouObj.paramValues, question?.params || [], data.paramsList);
        Object.assign(ouObj.paramValues, additionalValues);
        for (const prop of additionalProps) {
          ouObj.paramValues[prop.name] = prop.data.value || '';
        }
      }
    }
  }
  if (data.paramsList) {
    for (const param in data.paramsList) {
      if (data.paramsList[param].type === 'select') {
        data.paramsList[param].options = data.paramsList[param].options.map((opt) => (opt === '' ? ' ' : opt));
      }
    }
    data.paramsList = reindexFiles(data);
  }
  return data;
};

const approvalStages = [
  { source: 'approvalList2', code: 'cauk' },
  { source: 'approvalListOG', code: 'og' },
];
// Если пришло не больше стольких согласующих, они сразу попадают в выбранные
const approverSelectThreshold = 1;

export const prepareApprovalJson = (data) => {
  const result = { id: data.ID, hints: {} };
  for (const { source, code } of approvalStages) {
    result[code] = { additional: [] };

    result.hints[code] = (data.hints && data.hints[source]) || '';
    if (!data[source]) {
      continue;
    }
    Object.values(data[source]).forEach((user) => {
      const newUser = { ...user };
      if (!result[code][newUser.group]) {
        result[code][newUser.group] = [];
      }
      newUser.question = new Set(user.question);
      newUser.selected = false;
      result[code][newUser.group].push(newUser);
    });

    for (const users of Object.values(result[code])) {
      if (users.length <= approverSelectThreshold) {
        for (const user of users) {
          user.selected = true;
        }
      }
    }
  }
  return result;
};
const extractKey = (key, value) => {
  return key.split('.').reduce((obj, key) => {
    if (Array.isArray(obj) && !obj[key]) {
      return obj.map((obj) => obj[key]);
    }
    return (obj && obj[key]) || '';
  }, value);
};

export const getRefValue = (param, params, values) => {
  const fullParam = typeof param === 'string' ? params[param] : param;
  const source = params[fullParam.source];
  const sourceValue = source?.type === 'ref' ? getRefValue(source, params, values) : values[fullParam.source];

  let res;
  if (fullParam.key) {
    res = extractKey(fullParam.key, sourceValue);
  } else if (typeof sourceValue === 'object' && source?.key) {
    res = extractKey(source.key, sourceValue);
  } else {
    res = sourceValue;
  }

  return res;
};

export const resolveParamCondition = (condition, params, values) => {
  const { source, key, op, value } = condition;
  const sourceVal = getRefValue(
    {
      type: 'ref',
      source,
      key,
    },
    params,
    values
  );
  let compVal = value;
  if (typeof value === 'object') {
    if (value.params?.length) {
      compVal = compVal.params.map((p) => getRefValue(p, params, values));
    } else {
      compVal = getRefValue(compVal, params, values);
    }
    switch (value.filter) {
      case 'add': {
        compVal = compVal.reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
        break;
      }
      default:
        break;
    }
  }

  switch (op) {
    case '=':
      return sourceVal == compVal;
    case '!=':
      return sourceVal != compVal;
    case '>=':
      return sourceVal >= compVal;
    case '<=':
      return sourceVal <= compVal;
    case '>':
      return sourceVal > compVal;
    case '<':
      return sourceVal < compVal;
  }
  return false;
};

export const resolveConditionArray = (conditions, paramsList, values) => {
  let ignore = false;
  for (let param of conditions) {
    if (typeof param === 'string') {
      let reverse = false;
      if (param[0] === '!') {
        param = param.substring(1);
        reverse = true;
      }
      if (!paramsList[param]) {
        if (!reverse) {
          return false;
        } else {
          continue;
        }
      }
      const val = paramsList[param].type === 'ref' ? getRefValue(param, paramsList, values) : values[param];
      let condition = !val || (Array.isArray(val) && !val.length);
      if (reverse) condition = !condition;

      if (condition) {
        return false;
      }
    } else {
      ignore = !resolveParamCondition(param, paramsList, values);
      if (ignore) {
        return false;
      }
    }
  }
  return true;
};

export const questionToRequest = (group, og = {}) => {
  const ou = group.ou.map((managementDepartment) => {
    let result = {};
    result[managementDepartment.id] = {};
    const files = [];
    for (const [param, info] of Object.entries(group.paramsList['__files'] || {})) {
      if (info.ouId.includes(managementDepartment.id)) {
        const value = {
          param,
          name: group.paramsList[param].description,
          ids: managementDepartment.paramValues[param]?.map((f) => f.id),
        };
        files.push(value);
      }
    }
    result[managementDepartment.id]['files'] = files;
    result[managementDepartment.id]['questions'] = managementDepartment.questions.map((question) => {
      const text = WizardQuestionText({
        text: question['question']['text'],
        paramsList: group['paramsList'],
        values: managementDepartment['paramValues'],
        textReturn: true,
      });
      const title = WizardQuestionText({
        text: question['question']['title'],
        paramsList: group['paramsList'],
        values: managementDepartment['paramValues'],
        textReturn: true,
      });

      return {
        parentId: question['parentId'],
        position: question['position'],
        voteResult: question['question']['voteResult'],
        text: text.join(' '),
        title: title.join(' '),
        values: managementDepartment.paramValues,
        questionID: question['question'].id,
        files,
      };
    });
    result[managementDepartment.id]['values'] = managementDepartment.paramValues;
    return result;
  });
  const body = {
    ou,
    group: group.id,
  };

  if (og) {
    body.og = og.id;
    body.initiator = og.initiator;
  }

  return body;
};
