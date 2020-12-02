import React from 'react';

import {
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
} from '../elements';
import { resolveParamCondition } from '../../util/util';
import Checkbox from './checkbox';
import CheckboxOg from './checkbox-og';

export function WizardQuestionParamList({ values, paramsList, data, og, onChange, onFocus, onBlur }) {
  const result = [];
  if (paramsList) {
    for (let paramName of paramsList) {
      if (data[paramName].condition) {
        let show = resolveParamCondition(data[paramName].condition, data, values);

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
            <UnitNumber
              key={paramName}
              value={values[paramName]}
              data={data[paramName]}
              onChange={onChange}
              name={paramName}
              params={data}
              paramsValues={values}
            />
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
              mode={data[paramName].mode}
            />
          );
          break;
          
        case 'org_select':
          prop = (
            <DatePicker
              key={paramName}
              value={values[paramName]}
              onChange={onChange}
              onFocus={onFocus}
              onBlur={onBlur}
              name={paramName}
              data={data[paramName]}
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
        case 'checkbox':
          prop = (
            <Checkbox
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
        case 'checkbox-og':
          prop = (
            <CheckboxOg
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
            <MultiSelect
              key={paramName}
              data={data[paramName]}
              value={values[paramName]}
              onChange={onChange}
              name={paramName}
              params={data}
              paramsValues={values}
            />
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
              og={og}
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
          prop = <List data={data[paramName]} value={values[paramName]} onChange={onChange} name={paramName} og={og} />;
          break;
        case 'ol-custom':
        case 'ul-custom':
          prop = (
            <CustomList
              data={data[paramName]}
              value={values[paramName]}
              onChange={onChange}
              name={paramName}
              params={data}
              paramsValues={values}
            />
          );
          break;
        case 'ol-collapsed':
        case 'ul-collapsed':
          prop = (
            <CollapsedList data={data[paramName]} value={values[paramName]} onChange={onChange} name={paramName} og={og} />
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
  }
  return result;
}
