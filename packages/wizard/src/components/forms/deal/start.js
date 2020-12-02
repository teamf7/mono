import React, { useEffect, useMemo, useState } from 'react';
import { Datalist } from '../../elements';
import '../../../styles/deal.sass';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions } from '../../../actions';
import { getDealTypical, getDealContractType, getDealActivityField, getDealVersionType } from '../../../reselect';
import server from '../../../util/server';
import { Header } from '../header';

const datalistParams = {
  key: 'name',
};
const versionTypes = {
  new: 'Новая',
  change: 'Изменение (изменяемая сделка)*',
  end: 'Досрочное прекращение*',
};

function WizardDealStart({
  typical,
  setDealTypical,
  contractType,
  setDealContractType,
  activityField,
  setDealActivityField,
  versionType,
  setDealVersionType,
}) {
  const [options, setOptions] = useState({
    contractType: [],
    activityField: [],
  });

  const optionsData = useMemo(() => {
    return {
      contractType: { ...datalistParams, options: options.contractType },
      activityField: { ...datalistParams, options: options.activityField },
    };
  }, [options]);

  useEffect(() => {
    fetch(server + '/API/internal/v1/get_ca_types.php')
      .then((r) => r.json())
      .then(setOptions);
  }, []);

  return (
    <>
      <Header title={'Создание сделки'} />
      <div className="deal-start-page">
        <div className="deal-start-page_title">Укажите тип создаваемой сделки</div>
        <div className="deal-start-page_block">
          <div className="deal__label deal__label_checkbox checkbox">
            <input id="typical-yes" type="radio" checked={typical} onChange={(e) => setDealTypical(true)} />
            <label htmlFor="typical-yes" style={{ color: typical ? '#000000' : '#757575' }}>
              Типовая сделка
            </label>
          </div>
          <div className="deal__label deal__label_checkbox checkbox">
            <input id="typical-no" type="radio" checked={!typical} onChange={(e) => setDealTypical(false)} />
            <label htmlFor="typical-no" style={{ color: !typical ? '#000000' : '#757575' }}>
              Нетиповая сделка
            </label>
          </div>

          <div className="deal__row">
            <div className="deal__item">
              <label className="deal__label" style={{ color: !typical ? '#000000' : '#757575' }}>
                Вид договора
              </label>
              <Datalist
                data={optionsData.contractType}
                value={contractType}
                onChange={(e) => setDealContractType(e.target.value)}
                disabled={typical}
              />
            </div>
          </div>

          <div className="deal__row">
            <div className="deal__item">
              <label className="deal__label" style={{ color: !typical ? '#000000' : '#757575' }}>
                Сфера деятельности
              </label>
              <Datalist
                data={optionsData.activityField}
                value={activityField}
                onChange={(e) => setDealActivityField(e.target.value)}
                disabled={typical}
              />
            </div>
          </div>
        </div>

        <div className="deal-start-page_title">Вид версии сделки</div>
        <div className="deal-start-page_block">
          <div>
            {Object.entries(versionTypes).map(([type, name]) => (
              <div key={type} className="deal__label deal__label_checkbox checkbox">
                <input
                  id={`version-${type}`}
                  type="radio"
                  checked={versionType === type}
                  value={type}
                  onChange={(e) => setDealVersionType(e.target.value)}
                />
                <label htmlFor={`version-${type}`}>{name}</label>
              </div>
            ))}
          </div>

          <div className="deal-info">
            * - только для сделок, согласование которых выполнялось ранее не в системе АИС КУ.
            <br />
            Если сделка уже была заведена и согласована в АИС КУ, то <span>изменяемую сделку</span> и
            <span>досрочное прекращение</span> сделки необходимо формировать из карточки сделки.
          </div>
          <a className="link" href="/deal/">
            Открыть реестр сделок
          </a>
        </div>
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    typical: getDealTypical(state),
    contractType: getDealContractType(state),
    activityField: getDealActivityField(state),
    versionType: getDealVersionType(state),
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(WizardDealStart);
