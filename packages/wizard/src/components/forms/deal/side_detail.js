import React, { useEffect, useMemo, useState } from 'react';
import { OrgSelect, DatePicker, Input } from '../../elements';

const sideName = ['Первая сторона сделки', 'Вторая сторона сделки', 'Третья сторона сделки', 'Четвертая сторона сделки'];

export default function WizardDealSideDetail({
  side,
  currentSide,
  showBsaBlock,
  availableRoles,
  setDealSideParam,
  setDealSide,
  canRemove,
  remove
}) {
  const [isActiveBSA, setActiveBSA] = useState(!!side.bsa);

  const roleOptions = availableRoles[currentSide].map((r) => (
    <option key={`role-${r.code}`} value={r.code}>
      {r.name}
    </option>
  ));

  // Поле выбора стороны, первая из селекта, вторая с поиском по ОГ или КСК
  const sideProp = useMemo(() => {
    return {
      type: 'org_select',
      lockOg: !currentSide,
      urlParams: 'side_num=' + (currentSide + 1),
    };
  }, [currentSide]);

  useEffect(() => {
    if (availableRoles.length && (!side.role || !availableRoles[currentSide].find(({ code }) => code === side.role))) {
      setDealSideParam({
        side: currentSide,
        param: 'role',
        value: availableRoles[currentSide][0].code,
      });
    }
  }, [side.role, currentSide, setDealSideParam, availableRoles]);

  const onCurrentSideUpdate = ({ target }) => {
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setDealSideParam({
      side: currentSide,
      param: target.name,
      value,
    });
  };

  const onSideChange = ({ target }) => {
    setDealSide({
      side: currentSide,
      value: target.value,
    });
    if (target.value?.name && (!target.value?.bsa || !target.value?.bsaDate)) {
      setActiveBSA(true);
    }
  };

  return (
    <>
      <div className="deal__form">
        <div className="deal-form__border">
          {canRemove && <button onClick={remove}>X</button>}
          <div className="deal__row">
            <div className="deal__item">
              <label className="deal__label">Роль стороны в сделке</label>
              <div className={`deal__select${roleOptions.length === 1 ? ' deal__select_disabled' : ''}`}>
                <select value={side.role} name="role" onChange={onCurrentSideUpdate} disabled={roleOptions.length === 1}>
                  {roleOptions}
                </select>
              </div>
            </div>

            <div className="deal__item">
              <label className="deal__label">Cторона сделки</label>
              <div className={`deal__select deal__select_disabled`}>
                <select value={currentSide} name="side" disabled={true}>
                  {sideName.map((r, i) => (
                    <option key={`role-${i}`} value={i}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <OrgSelect data={sideProp} value={{ name: side.name, isOg: side.isOg }} onChange={onSideChange} name="side" />
          {side.isOg && showBsaBlock && (
            <>
              <div className="deal__row deal__row_label">
                <div className="deal__item side-item">
                  <input
                    id={`bsa__${currentSide}`}
                    type="checkbox"
                    checked={isActiveBSA}
                    onChange={(e) => setActiveBSA(e.target.checked)}
                    disabled={!side.name.length}
                  />
                  <label htmlFor={`bsa__${currentSide}`}>Указать данные БСА вручную</label>
                </div>
              </div>
              <div className="deal__row">
                <div className="deal__item">
                  <label className="deal__label">БСА на дату</label>
                  <DatePicker onChange={onCurrentSideUpdate} value={side.bsaDate} name="bsaDate" disabled={!isActiveBSA} />
                </div>
                <div className="deal__item">
                  <label className="deal__label">Сумма БСА, руб</label>
                  <div className="react-datepicker-wrapper">
                    <Input
                      className="deal__input"
                      type="number"
                      value={String(side.bsa)}
                      name="bsa"
                      onChange={onCurrentSideUpdate}
                      disabled={!isActiveBSA}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
