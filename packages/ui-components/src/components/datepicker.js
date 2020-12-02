import React, { useEffect } from 'react';
import DatePicker from 'react-datepicker';
import ru from 'date-fns/locale/ru';
import Icon from '@mdi/react';
import { mdiCalendar } from '@mdi/js';
import '../../styles/ui-components/date-picker.sass';

export default function Datepicker({ name, value, onChange, onFocus, onBlur, mode = 'day', type = 'date', disabled }) {
  useEffect(() => {
    if (typeof value === 'string') {
      onChange({
        target: { value: value ? new Date(value) : new Date(), name, type },
      });
    }
  }, []);

  if (typeof value === 'string') {
    return null;
  }

  const onDateChange = (date) => {
    onChange({
      target: { value: date, name, type },
    });
  };

  const onFocusHandle = (e) => {
    onFocus &&
      onFocus({
        target: { name },
      });
  };

  const onBlurHandle = (e) => {
    onBlur &&
      onBlur({
        target: { name },
      });
  };

  if (isNaN(Date.parse(value))) {
    value = null;
  }

  return (
    <DatePicker
      onChange={onDateChange}
      onCalendarOpen={onFocusHandle}
      onCalendarClose={onBlurHandle}
      selected={value}
      dateFormat={mode === 'year' ? 'yyyy' : 'dd.MM.yyyy'}
      className="wizard-element-input wizard-element-input-date"
      locale={ru}
      showYearPicker={mode === 'year'}
      clearIcon={null}
      calendarIcon={<Icon path={mdiCalendar} className="icon-date" />}
      disabled={disabled}
    />
  );
}
