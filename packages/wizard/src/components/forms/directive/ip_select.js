import React, { useState, useMemo } from 'react';
import { Header } from '../header';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions } from '../../../actions';
import { getIpList } from '../../../reselect';
import Input from '../../elements/input';
import Pagination from '@material-ui/lab/Pagination';
import Icon from '@mdi/react';
import { mdiWindowClose, mdiMagnify, mdiSortAscending, mdiSortDescending, mdiTune } from '@mdi/js';

import '../../../styles/ui-components/filter.sass';
import '../../../styles/ui-components/pagination.sass';

const pageSize = 50;

const matchesSearch = (search, fields, ip) => {
  if (!search) {
    return true;
  }
  for (const field of fields) {
    if (ip[field]?.includes(search)) {
      return true;
    }
  }
  return false;
};

const searchFieldInfo = [
  { code: 'nameLower', name: 'Номер ИП' },
  { code: 'ogLower', name: 'ОГ' },
  { code: 'compOgLower', name: 'Компетенция ОГ' },
  { code: 'compRnLower', name: 'Компетенция РН' },
  { code: 'createdDate', name: 'Создано' },
  { code: 'executorLower', name: 'Исполнитель' },
  { code: 'routeLower', name: 'Вид вопроса' },
];

function DirectiveIpSelect({ ips, toggleIp }) {
  const [search, setSearch] = useState('');
  const [searchFields, setSearchFields] = useState(
    searchFieldInfo.reduce((acc, { code }) => {
      acc[code] = true;
      return acc;
    }, {})
  );
  const [showFilterSettings, setShowFilterSettings] = useState(false);
  const [sort, setSort] = useState('id');
  const [currentPage, setPage] = useState(0);

  const [sortField, sortReverse] = sort.split('|');

  let foundIps = 0;
  const searchLower = search.toLowerCase();

  const searchFieldNames = useMemo(
    () =>
      Object.entries(searchFields)
        .filter(([f, use]) => use)
        .map(([f]) => f),
    [searchFields]
  );
  const toggleSearchFields = (field) => () => {
    setPage(0);
    setSearchFields({ ...searchFields, [field]: !searchFields[field] });
  };

  const toggleAllSearchFields = (selected) => () => {
    setPage(0);
    setSearchFields(
      searchFieldInfo.reduce((acc, { code }) => {
        acc[code] = selected;
        return acc;
      }, {})
    );
  };

  const toggleSort = (field) => () => {
    setPage(0);
    if (sortField === field) {
      if (sortReverse) {
        setSort(field);
      } else {
        setSort(`${field}|reverse`);
      }
    } else {
      setSort(field);
    }
  };

  const searchFieldOptions = useMemo(
    () =>
      searchFieldInfo.map(({ code, name }) => (
        <div className="deal__item side-item" key={`filter-option-${code}`}>
          <input
            id={`filter-option-${code}`}
            type="checkbox"
            checked={searchFields[code]}
            onChange={toggleSearchFields(code)}
          />
          <label htmlFor={`filter-option-${code}`}>{name}</label>
        </div>
      )),
    [searchFields]
  );

  const ipList = useMemo(() => {
    const list = {
      available: [],
      selected: [],
    };
    let full = false;
    let greater = sortReverse ? 1 : -1;
    let lesser = sortReverse ? -1 : 1;
    const sortedIps = ips
      .slice()
      .sort((a, b) => (a[sortField] > b[sortField] ? greater : a[sortField] < b[sortField] ? lesser : 0));

    for (const ip of sortedIps) {
      if (ip.selected) {
        list.selected.push(
          <div className="selected-results__ip-name" key={`ip-search-selected-item-${ip.id}`} onClick={() => toggleIp(ip.id)}>
            {ip.name}
            <Icon className="icon-delete" path={mdiWindowClose} />
          </div>
        );
      }

      if (matchesSearch(searchLower, searchFieldNames, ip)) {
        foundIps++;
        if (foundIps > currentPage * pageSize && !full) {
          list.available.push(
            <tr className="table__row" key={`ip-search-item-${ip.id}`}>
              <td className="table__cell" style={{ verticalAlign: 'middle', width: '50px' }}>
                <div className="table-body__text table-body__checkbox">
                  <div className="side-item">
                    <input id={ip.id} type="checkbox" checked={ip.selected} onChange={() => toggleIp(ip.id)} />
                    <label htmlFor={ip.id}></label>
                  </div>
                </div>
              </td>
              <td className="table__cell">
                <div className="table-body__text">{ip.name}</div>
              </td>
              <td className="table__cell">
                <div className="table-body__text">{ip.og}</div>
              </td>
              <td className="table__cell">
                <div className="table-body__text">{ip.compOg}</div>
              </td>
              <td className="table__cell">
                <div className="table-body__text">{ip.compRn}</div>
              </td>
              <td className="table__cell">
                <div className="table-body__text">{ip.createdDate}</div>
              </td>
              <td className="table__cell">
                <div className="table-body__text">{ip.executor}</div>
              </td>
              <td className="table__cell">
                <div className="table-body__text">{ip.route}</div>
              </td>
            </tr>
          );
        }
      }
      if (list.available.length === pageSize) {
        full = true;
      }
    }
    return list;
  }, [ips, search, searchFieldNames, currentPage, sort]);

  const pages = Math.ceil(foundIps / pageSize);
  return (
    <>
      <Header title="Редактирование проекта директивы" stepCounter={{ current: 2, last: 5 }} />
      <div className="directive-wide-table">
        <div className="directive__title">Выберите ИП для включения дополнительных вопросов</div>
        <div className="directive-search">
          <div className="directive__search-block">
            <Input
              value={search}
              onChange={(e) => {
                setPage(0);
                setSearch(e.target.value);
              }}
              className="wizard-element-search"
              placeholder="Поиск"
            />
            <Icon className="icon-search" path={mdiMagnify} />
          </div>

          <div className="filter">
            <div className="filter__container">
              <div className="filter__button" onClick={() => setShowFilterSettings(!showFilterSettings)}>
                <Icon className="icon-filter" path={mdiTune} />
                <span className="filter__name">Фильтр</span>
              </div>
              {showFilterSettings && (
                <div className="filter__dropdown">
                  <div className="filter__check-buttons">
                    <span className="filter__check" onClick={toggleAllSearchFields(true)}>
                      Выделить все
                    </span>
                    <span className="filter__check" onClick={toggleAllSearchFields(false)}>
                      Снять все
                    </span>
                  </div>
                  <div className="filter__options">{searchFieldOptions}</div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead className="table__head">
              <tr className="table__row">
                <th className="table__cell table__cell_head"></th>
                <th
                  className={`table__cell table__cell_head${sortField === 'id' ? ' table__cell_sorted' : ''}`}
                  onClick={toggleSort('id')}
                  style={{ minWidth: '150px' }}
                >
                  <div className="table-cell__content">
                    <span className="table-cell__text">Номер ИП</span>
                    {sortField === 'id' && (
                      <Icon className="icon-table-sort" path={sortReverse ? mdiSortDescending : mdiSortAscending} />
                    )}
                  </div>
                </th>
                <th
                  className={`table__cell table__cell_head${sortField === 'og' ? ' table__cell_sorted' : ''}`}
                  onClick={toggleSort('og')}
                  style={{ minWidth: '100px' }}
                >
                  <div className="table-cell__content">
                    <span className="table-cell__text">ОГ</span>
                    {sortField === 'og' && (
                      <Icon className="icon-table-sort" path={sortReverse ? mdiSortDescending : mdiSortAscending} />
                    )}
                  </div>
                </th>
                <th
                  className={`table__cell table__cell_head${sortField === 'compOg' ? ' table__cell_sorted' : ''}`}
                  onClick={toggleSort('compOg')}
                  style={{ minWidth: '100px' }}
                >
                  <div className="table-cell__content">
                    <span className="table-cell__text">
                      Компетенция
                      <br />
                      ОГ
                    </span>
                    {sortField === 'compOg' && (
                      <Icon className="icon-table-sort" path={sortReverse ? mdiSortDescending : mdiSortAscending} />
                    )}
                  </div>
                </th>
                <th
                  className={`table__cell table__cell_head${sortField === 'compRn' ? ' table__cell_sorted' : ''}`}
                  onClick={toggleSort('compRn')}
                  style={{ minWidth: '100px' }}
                >
                  <div className="table-cell__content">
                    <span className="table-cell__text">
                      Компетенция
                      <br />
                      РН
                    </span>
                    {sortField === 'compRn' && (
                      <Icon className="icon-table-sort" path={sortReverse ? mdiSortDescending : mdiSortAscending} />
                    )}
                  </div>
                </th>
                <th
                  className={`table__cell table__cell_head${sortField === 'createdDate' ? ' table__cell_sorted' : ''}`}
                  onClick={toggleSort('createdDate')}
                >
                  <div className="table-cell__content">
                    <span className="table-cell__text">Создан</span>
                    {sortField === 'createdDate' && (
                      <Icon className="icon-table-sort" path={sortReverse ? mdiSortDescending : mdiSortAscending} />
                    )}
                  </div>
                </th>
                <th
                  className={`table__cell table__cell_head${sortField === 'executor' ? ' table__cell_sorted' : ''}`}
                  onClick={toggleSort('executor')}
                >
                  <div className="table-cell__content">
                    <span className="table-cell__text">Исполнитель</span>
                    {sortField === 'executor' && (
                      <Icon className="icon-table-sort" path={sortReverse ? mdiSortDescending : mdiSortAscending} />
                    )}
                  </div>
                </th>
                <th
                  className={`table__cell table__cell_head${sortField === 'route' ? ' table__cell_sorted' : ''}`}
                  onClick={toggleSort('route')}
                >
                  <div className="table-cell__content">
                    <span className="table-cell__text">Вид вопроса</span>
                    {sortField === 'route' && (
                      <Icon className="icon-table-sort" path={sortReverse ? mdiSortDescending : mdiSortAscending} />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="table__body">{ipList.available}</tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="pagination">
            <div className="pagination__page-counter">
              {currentPage === 0 ? '1' : currentPage} из {Array(pages).length}
            </div>
            <Pagination count={Array(pages).length} defaultPage={1} onChange={(event, page) => setPage(page)} />
          </div>
        )}
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    ips: getIpList(state),
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(DirectiveIpSelect);
