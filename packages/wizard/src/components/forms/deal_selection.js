import React, { useCallback, useMemo, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Header } from './header';
import { actions } from '../../actions';
import { getFilteredDealsIp, getDealsIpSearch } from '../../reselect';
import Input from '../elements/input';

import '../../styles/ui-components/sort.sass';

function WizardDealSelection({ deals, search, setDealsSelected, setDealSelectionSearch }) {
  const setSearchVal = (e) => setDealSelectionSearch({ ...search, [e.target.name]: e.target.value });
  const setSearchSide = (side) => (e) => {
    const sides = search.sides.slice();
    sides[side] = { ...sides[side], [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value };

    setDealSelectionSearch({ ...search, sides });
  };

  const memoizedOnSelect = useCallback((e) => {
    const val = parseInt(e.target.value);
    setDealsSelected({ value: val, checked: e.target.checked });
  });

  return (
    <>
      <Header title="Выбор сделок" />
      <div className="deal__table">
        <div className="deal__block">
          <div className="deal__row">
            <div className="deal__item">
              <label className="deal__label">Номер сделки</label>
              <input className="deal__input" value={search.id} name="id" onChange={setSearchVal} />
            </div>
            <div className="deal__item">
              <label className="deal__label">Минимальная сумма сделки</label>
              <Input className="deal__input" value={search.minSum} name="minSum" type="number" onChange={setSearchVal} />
            </div>
            <div className="deal__item">
              <label className="deal__label">Максимальная сумма сделки</label>
              <Input className="deal__input" value={search.maxSum} name="maxSum" type="number" onChange={setSearchVal} />
            </div>
          </div>
          <div className="deal__row">
            <div className="deal__item">
              <div className="deal__label deal__label_checkbox checkbox">
                <input
                  id="input-checkbox-deal-og-1"
                  type="checkbox"
                  checked={search.sides[0].isOg}
                  name="isOg"
                  onChange={setSearchSide(0)}
                />
                <label htmlFor="input-checkbox-deal-og-1">1 сторона {search.sides[0].isOg && 'ОГ'}</label>
              </div>
              <input className="deal__input" value={search.sides[0].name} onChange={setSearchSide(0)} name="name" />
            </div>
            <div className="deal__item">
              <div className="deal__label deal__label_checkbox checkbox">
                <input
                  id="input-checkbox-deal-og-2"
                  type="checkbox"
                  checked={search.sides[1].isOg}
                  name="isOg"
                  onChange={setSearchSide(1)}
                />
                <label htmlFor="input-checkbox-deal-og-2">2 сторона {search.sides[1].isOg && 'ОГ'}</label>
              </div>
              <input className="deal__input" value={search.sides[1].name} onChange={setSearchSide(1)} name="name" />
            </div>
          </div>
          <div className="deal__row deal__row_right">
            <div className="sort">
              <label className="sort__label">Сортировать по</label>
              <div className="sort__select">
                <select value={search.sortBy} onChange={(e) => setDealSelectionSearch({ ...search, sortBy: e.target.value })}>
                  <option value="id">номеру сделки</option>
                  <option value="sum">сумме</option>
                  <option value="side.1">первой стороне</option>
                  <option value="side.2">второй стороне</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead className="table__head">
              <tr className="table__row">
                <th className="table__cell table__cell_head"></th>
                <th className="table__cell table__cell_head" style={{ minWidth: '110px' }}>
                  <div className="table-head__text">№ сделки</div>
                </th>
                <th className="table__cell table__cell_head">
                  <div className="table-head__text">1 сторона {search.sides[0].isOg && 'ОГ'}</div>
                </th>
                <th className="table__cell table__cell_head">
                  <div className="table-head__text">2 сторона {search.sides[1].isOg && 'ОГ'}</div>
                </th>
                <th className="table__cell table__cell_head">
                  <div className="table-head__text">Сумма</div>
                </th>
                <th className="table__cell table__cell_head">
                  <div className="table-head__text">Предмет сделки</div>
                </th>
              </tr>
            </thead>
            <tbody className="table__body">
              {deals.map((deal) => {
                return (
                  <tr key={deal.id} className="table__row">
                    <td className="table__cell" style={{ verticalAlign: 'middle', width: '50px' }}>
                      <div className="table-body__text table-body__checkbox">
                        <div className="side-item">
                          <input
                            id={`deal-checkbox-table-${deal.id}`}
                            type="checkbox"
                            value={deal.id}
                            checked={deal.selected}
                            onChange={memoizedOnSelect}
                          />
                          <label htmlFor={`deal-checkbox-table-${deal.id}`}></label>
                        </div>
                      </div>
                    </td>
                    <td className="table__cell">
                      <div className="table-body__text">{deal.id}</div>
                    </td>
                    <td className="table__cell">
                      <div className="table-body__text">{deal.sides[0]?.name}</div>
                    </td>
                    <td className="table__cell">
                      <div className="table-body__text">{deal.sides[1]?.name}</div>
                    </td>
                    <td className="table__cell">
                      <div className="table-body__text">{deal.sum}</div>
                    </td>
                    <td className="table__cell" style={{ maxWidth: '400px', wordBreak: 'break-word', wordWrap: 'break-word' }}>
                      <div className="table-body__text">{deal.text}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    deals: getFilteredDealsIp(state),
    search: getDealsIpSearch(state),
  };
};

// Добавляем actions к this.props
const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(WizardDealSelection);
