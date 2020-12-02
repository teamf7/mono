import React, { useEffect, useMemo } from 'react';
import { DatePicker, WizardQuestionText, Input } from '../../elements';
import '../../../styles/deal.sass';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions } from '../../../actions';
import {
  dealSumSelector,
  dealVatsSelector,
  dealCurrenciesSelector,
  dealSumTypeSelector,
  dealSidesSelector,
} from '../../../reselect';

const sumText = (hasSecondSide, vatKindCode) => {
  const secondSideText = hasSecondSide
    ? `, #bsaSecondSide#% от балансовой стоимости активов #secondSide# по состоянию на #bsaDateSecondSide#`
    : '';
  const res = `#sumName# ${vatKindCode === '1' ? '#sumVatIncluded#' : '#sum#'} #currency# 
               ${vatKindCode === '1' ? 'без учета НДС' : '#vatKind#'}
               ${vatKindCode !== '2' ? ' #vat#% ' : ''} 
               (#bsa#% от балансовой стоимости активов #firstSide# по состоянию на #bsaDate#${secondSideText})`;
  return res;
};
const sumProps = {
  sumName: { type: 'input' },
  sum: { type: 'input' },
  sumVatIncluded: { type: 'input' },
  currency: { type: 'input' },
  vat: { type: 'input' },
  vatKind: { type: 'input' },
  vatTotalValue: { type: 'input' },
  bsa: { type: 'input' },
  bsaSecondSide: { type: 'input' },
  firstSide: { type: 'input' },
  secondSide: { type: 'input' },
  bsaDate: { type: 'input' },
  bsaDateSecondSide: { type: 'input' },
};

const obligationsAgentText = 'Общая сумма расходов по сделке составит #sumObligations# #currency#';

const obligationsText = `Общая сумма обязательств по сделке может составить #sumUSD# млн. долларов США
                         (по курсу, установленному ЦБ РФ на #rateDate# - #rate# руб)`;

const obligationsProps = {
  sumUSD: { type: 'input' },
  sumObligations: { type: 'input' },
  rateDate: { type: 'input' },
  rate: { type: 'input' },
  currency: { type: 'input' },
};

const getVatIncludedName = (vatIncludedCode) =>
  ({
    '0': 'с учетом НДС',
    '1': 'без учета НДС',
    '2': '(НДС не облагается)',
  }[vatIncludedCode]);

const sumAssetTypes = {
  1: 'непрофильного актива',
  2: 'недвижимого имущества',
};

const toSumTextValues = (sum, vat, vatIncluded, vatTotal, sumName, type, currencies, sides, currentCurrency) => {
  const sumRub = Math.round(sum * 100 * (currencies.rates[currentCurrency.code] / currencies.rates['RUB'])) / 100;
  const bsa = Math.round((sumRub / sides[0].bsa) * 10000) / 100;
  const bsaSecondSide = sides[1] && Math.round((sumRub / sides[1].bsa) * 10000) / 100;
  const sumVatIncluded = Number(sum) + Number(sum) * (vat / 100);

  let bsaDateSecondSide = null;
  if (sides[1] && sides[1].bsaDate && !isNaN(Date.parse(sides[1].bsaDate))) {
    bsaDateSecondSide = sides[1].bsaDate.toLocaleDateString();
  }

  return {
    sumName: `${sumName} ${sides[0].role === 'prodavets' ? type + ' составляет' : ''}`,
    sum: !isNaN(sum) ? Number(sum).toLocaleString('ru') : '0',
    sumVatIncluded: sumVatIncluded.toLocaleString('ru'),
    vatKind: getVatIncludedName(vatIncluded),
    vatTotalValue: vatTotal,
    currency: currentCurrency.name,
    vat: vat === '' ? '0' : Number(vat).toLocaleString('ru'),
    bsa: isFinite(bsa) && !isNaN(bsa) ? Number(bsa).toLocaleString('ru') || '0' : '0',
    bsaSecondSide: isFinite(bsaSecondSide) && !isNaN(bsaSecondSide) ? Number(bsaSecondSide).toLocaleString('ru') || '0' : '0',
    firstSide: sides[0].name,
    secondSide: sides[1] && sides[1].name,
    bsaDate: sides[0].bsaDate.toLocaleDateString(),
    bsaDateSecondSide: bsaDateSecondSide,
  };
};

const vatToValue = (sum, vat, type) => {
  let res;
  switch (type.toString()) {
    case '0':
    case 'false':
      res = sum - sum / (vat / 100 + 1);
      break;
    case '1':
      res = sum * (vat / 100);
      break;
    case '2':
      res = 0;
      break;
  }
  return Number(res.toFixed(2)).toLocaleString('ru');
};

const noChangeList = ['printsipal', 'agent'];

function WizardDealSum({ sum, type, currencies, vats, fetchCurrencyRates, sides, setCurrencyRate, setDealSum }) {
  const onValueChange = ({ target }) => {
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setDealSum({
      param: target.name,
      /** т.к. разрядность чисел у нас разбивается пробелами, чистим эти пробелы перед записью в action */
      value: target.type === 'text' && target.getAttribute('fieldtype') === 'number' ? value.split(' ').join('') : value,
    });
    const condition = sides?.some((el) => noChangeList?.includes(el.role));
    if (!condition && target.name === 'sum') {
      setDealSum({
        param: 'obligations',
        /** т.к. разрядность чисел у нас разбивается пробелами, чистим эти пробелы перед записью в action */
        value: target.type === 'text' && target.getAttribute('fieldtype') === 'number' ? value.split(' ').join('') : value,
      });
    }
    if (!condition && target.name === 'currency') {
      setDealSum({
        param: 'obligationsCurrency',
        /** т.к. разрядность чисел у нас разбивается пробелами, чистим эти пробелы перед записью в action */
        value: target.type === 'text' && target.getAttribute('fieldtype') === 'number' ? value.split(' ').join('') : value,
      });
    }
  };
  const onCurrencyDateChange = ({ target: { value } }) => {
    if (value) {
      fetchCurrencyRates(value);
    }
  };
  const onRateChange = ({ target: { value } }) => {
    setCurrencyRate({ currency: sum.currency, rate: value });
  };

  const currencyOptions = currencies.list.map((c) => (
    <option key={`cur-opt-${c.code}`} value={c.code}>
      {c.name}
    </option>
  ));

  const vatOptions = vats.map((option) => (
    <option key={`vat-opt-${option.code}`} value={option.code}>
      {option.name}
    </option>
  ));

  const vatTotalValue = vatToValue(sum.sumTotal, sum.vat, sum.vatIncluded);
  const minVatTotalValue = vatToValue(sum.minSumTotal, sum.minVat, sum.minVatIncluded);

  const currentCurrency = useMemo(() => {
    return currencies.list.find((c) => c.code === sum.currency);
  }, [sum.currency, currencies.list]);

  const obligationsTextValues = useMemo(() => {
    const currency = currencies.list.find((c) => c.code === sum.obligationsCurrency);
    const sumToUSD = (sum.obligations.toString() / (currencies.rates['USD'] / currencies.rates[currency?.code])) * 1e-6;

    return {
      sumUSD: Number(sumToUSD.toFixed(sumToUSD > 1 ? 2 : 4)).toLocaleString('ru', { maximumSignificantDigits: 4 }),
      sumObligations: sum.obligations === '' ? '0' : Number(sum.obligations).toLocaleString('ru'),
      rateDate: currencies.ratesDate.toLocaleDateString(),
      rate: Number(currencies.rates['USD'].toFixed(2)).toLocaleString('ru', { maximumSignificantDigits: 4 }),
      currency: currency?.name,
    };
  }, [sum.obligations, currencies, sum.obligationsCurrency]);

  const sumTextValues = useMemo(() => {
    return toSumTextValues(
      sum.sumTotal,
      sum.vat,
      sum.vatIncluded,
      vatTotalValue,
      type.sumName,
      sum.type,
      currencies,
      sides,
      currentCurrency
    );
  }, [sum.sumTotal, sum.vat, sum.vatIncluded, type.sumName, sum.type, currencies, sides, currentCurrency]);

  const minSumTextValues = useMemo(() => {
    return toSumTextValues(
      sum.minSumTotal,
      sum.minVat,
      sum.minVatIncluded,
      minVatTotalValue,
      type.minSumName,
      sum.type,
      currencies,
      sides,
      currentCurrency
    );
  }, [sum.minSumTotal, sum.minVat, sum.minVatIncluded, type.minSumName, sum.type, currencies, sides, currentCurrency]);

  const sumTypeOptions = type.sumTypes?.map((type, i) => (
    <option key={type} value={type}>
      {sumAssetTypes[type]}
    </option>
  ));

  useEffect(() => {
    if (type.sumTypes?.length && !sum.type) {
      setDealSum({ param: 'type', value: type.sumTypes[0] });
    }
  }, [sum.type, type.sumTypes, setDealSum]);

  return (
    <>
      <div className="form-title">Сумма сделки</div>
      <div className="deal">
        <div className="deal__form">
          <div className="deal__row">
            <div className="deal__item">
              <label className="deal__label">
                {type.sumLabel}

                {type.sumTypes && (
                  <select value={sum.type} name="type" onChange={onValueChange}>
                    {sumTypeOptions}
                  </select>
                )}
              </label>
              <Input className="deal__input" type="number" min="0" value={sum.sum} name="sum" onChange={onValueChange} />
            </div>

            <div className="deal__item">
              <label className="deal__label">Валюта сделки</label>
              <div className="deal__select">
                <select value={sum.currency} name="currency" onChange={onValueChange}>
                  {currencyOptions}
                </select>
              </div>
            </div>
          </div>

          <div className="deal__row">
            <div className="deal__item">
              <label className="deal__label">НДС</label>
              <div className="deal__select">
                <select value={sum.vatIncluded} name="vatIncluded" onChange={onValueChange}>
                  {vatOptions}
                </select>
              </div>
            </div>

            <div className="deal__item">
              {sum.vatIncluded !== '2' ? (
                <>
                  <label className="deal__label">Ставка НДС, %</label>
                  <Input
                    type="number"
                    className="deal__input deal__input_percent"
                    value={sum.vat}
                    min="0"
                    max="99"
                    name="vat"
                    onChange={onValueChange}
                  />
                </>
              ) : (
                ''
              )}
            </div>
          </div>

          {sum.vatIncluded !== '2' ? (
            <div className="deal__row">
              <div className="deal__item">
                <label className="deal__label">Размер НДС</label>
                <input className="deal__input" value={vatTotalValue} disabled />
              </div>

              <div className="deal__item">
                <label className="deal__label">Валюта НДС</label>
                <div className="deal__select deal__select_disabled">
                  <select value={sum.currency} disabled="disabled">
                    {currencyOptions}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            ''
          )}
        </div>
        <div className="deal__row">
          <div className="deal__text">
            <WizardQuestionText
              text={sumText(Boolean(sumTextValues.bsaDateSecondSide), sum.vatIncluded)}
              paramsList={sumProps}
              values={sumTextValues}
            />
          </div>
        </div>

        {type.minSumName && (
          <>
            <div className="deal__form">
              <div className="deal__row">
                <div className="deal__item">
                  <label className="deal__label">{type.minSumName} </label>
                  <Input
                    className="deal__input"
                    type="number"
                    min="0"
                    value={sum.minSum}
                    name="minSum"
                    onChange={onValueChange}
                  />
                </div>

                <div className="deal__item">
                  <label className="deal__label">Валюта сделки</label>
                  <div className="deal__select deal__select_disabled">
                    <select value={sum.currency} disabled="disabled">
                      {currencyOptions}
                    </select>
                  </div>
                </div>
              </div>

              <div className="deal__row">
                <div className="deal__item">
                  <label className="deal__label">НДС</label>
                  <div className="deal__select">
                    <select value={sum.minVatIncluded} name="minVatIncluded" onChange={onValueChange}>
                      {vatOptions}
                    </select>
                  </div>
                </div>

                <div className="deal__item">
                  {sum.minVatIncluded !== '2' ? (
                    <>
                      <label className="deal__label">Ставка НДС, %</label>
                      <Input
                        type="number"
                        className="deal__input deal__input_percent"
                        value={sum.minVat}
                        min="0"
                        max="99"
                        name="minVat"
                        onChange={onValueChange}
                      />
                    </>
                  ) : (
                    ''
                  )}
                </div>
              </div>
              {sum.minVatIncluded !== '2' ? (
                <div className="deal__row">
                  <div className="deal__item">
                    <label className="deal__label">Размер НДС</label>
                    <input className="deal__input" value={minVatTotalValue} disabled />
                  </div>

                  <div className="deal__item">
                    <label className="deal__label">Валюта НДС</label>
                    <div className="deal__select deal__select_disabled">
                      <select value={sum.currency} disabled="disabled">
                        {currencyOptions}
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                ''
              )}
            </div>

            <div className="deal__row">
              <div className="deal__text">
                <WizardQuestionText
                  text={sumText(Boolean(sumTextValues.bsaDateSecondSide), sum.minVatIncluded)}
                  paramsList={sumProps}
                  values={minSumTextValues}
                />
              </div>
            </div>
          </>
        )}

        <div className="deal__form">
          <div className="deal__row deal__row_title">
            <div className="deal__item">
              <label className="deal__label">Сумма обязательств (расходов)</label>
            </div>
          </div>
          <div className="deal__row">
            <div className="deal__item">
              <Input
                className="deal__input"
                type="number"
                min="0"
                value={sum.obligations}
                name="obligations"
                onChange={onValueChange}
              />
            </div>

            <div className="deal__item">
              <div className="deal__select">
                <select value={sum.obligationsCurrency} name="obligationsCurrency" onChange={onValueChange}>
                  {currencyOptions}
                </select>
              </div>
            </div>
          </div>
          {sum.currency !== 'USD' && (
            <>
              <div className="deal__row">
                <div className="deal__item">
                  <label className="deal__label">Дата курса USD</label>
                  <DatePicker onChange={onCurrencyDateChange} value={currencies.ratesDate} name="rateDate" />
                </div>
                <div className="deal__item" />
              </div>
              <div style={{ display: !currencies.ratesAvailable ? '' : 'none' }}>
                <div className="deal__item">
                  <label className="deal__label">Курс на дату недоступен, укажите вручную (1 USD равен)</label>
                </div>
              </div>
              <div className="deal__row" style={{ display: !currencies.ratesAvailable ? '' : 'none' }}>
                <div className="deal__item">
                  <Input
                    className="deal__input"
                    type="number"
                    min="0"
                    value={currencies.rates[sum.currency]}
                    onChange={onRateChange}
                  />
                </div>
                <div className="deal__item">
                  <div className="deal__select">
                    <select disabled="disabled" value={sum.currency}>
                      {currencyOptions}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        {type.type === 'agent' ? (
          <div className="deal__row">
            <div className="deal__text">
              <WizardQuestionText text={obligationsAgentText} paramsList={obligationsProps} values={obligationsTextValues} />
            </div>
          </div>
        ) : null}
        <div className="deal__row">
          <div className="deal__text">
            <WizardQuestionText text={obligationsText} paramsList={obligationsProps} values={obligationsTextValues} />
          </div>
        </div>
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    sides: dealSidesSelector(state),
    sum: dealSumSelector(state),
    type: dealSumTypeSelector(state),
    currencies: dealCurrenciesSelector(state),
    vats: dealVatsSelector(state),
  };
};

// Добавляем actions к this.props
const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(WizardDealSum);
