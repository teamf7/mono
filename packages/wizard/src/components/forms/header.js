import React from 'react';
import '../../styles/ui-components/header.sass';

export function Header({ title, stepCounter }) {
  return (
    <div className="header">
      <span className="header__title">{title}</span>
      {stepCounter && (
        <span className="header__step">
          Шаг {stepCounter.current} / {stepCounter.last}
        </span>
      )}
    </div>
  );
}
