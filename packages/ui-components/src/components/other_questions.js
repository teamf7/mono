import React from 'react';
import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Hint from './hint';

export default function OtherQuestions({ items, onClick, nameKey }) {
  if (typeof items.length === 'undefined' || items.length === 0) {
    return null;
  }

  const menuItems = items.map((item, index) => {
    return (
      <div
        key={item.id +'-'+ index}
        className="question-group-item pointer"
        onClick={() => onClick(item.id)}
      >
        <div className="question-title">
          {item[nameKey]}
          {item && item.hint ? <Hint text={item.hint} /> : ''}
        </div>
        <Icon className="icon-add" path={mdiPlus} />
      </div>
    );
  });

  return <div className="question-group-body">{menuItems}</div>;
}
