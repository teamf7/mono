import produce from 'immer';
import { types as actionTypes } from '../actions';

function rawToSide(value) {
  return {
    name: value?.name || '',
    id: value?.id || '',
    ogrn: value?.ogrn || '',
    bsa: value?.bsa || '0',
    bsaDate: value?.bsaDate ? new Date(value.bsaDate.replace(/(\d+).(\d+).(\d+)/, '$3-$2-$1')) : null,
  };
}

function createSide(sideNum, rolesBySide) {
  const newSide = {
    isOg: true,
    id: '',
    name: '',
    ogrn: '',
    bsa: 0,
    bsaDate: null,
  };
  if (rolesBySide && rolesBySide[sideNum].length === 1) {
    newSide.role = rolesBySide[sideNum][0];
  } else {
    newSide.role = '';
  }
  return newSide;
}

export const initialState = {
  typical: true,
  contractType: null,
  activityField: null,
  versionType: 'new',
  subject: {},
  subjectBasic: {
    type: '',
    text: '',
  },
  justification: {
    extra: '',
    goal: '',
    contractorChoice: '',
    priceFormation: '',
    buying: '',
  },
  sum: {
    sum: '0',
    sumTotal: '0',
    type: '',
    minSum: '0',
    minSumTotal: '0',
    obligations: '0',
    obligationsCurrency: 'RUB',
    currency: 'RUB',
    vatIncluded: '0',
    vat: '20',
    minVatIncluded: '0',
    minVat: '0',
  },
  roles: {},
  rolesBySide: [],
  currencies: {
    list: [],
    rates: {},
    ratesDate: new Date(),
    ratesAvailable: true,
  },
  vats: [],
  sides: [],
  isAgent: false,
  redirectUrl: '/',
};

const makeConstRefProp = (key, description) => ({
  type: 'ref',
  source: 'wizardConstant_data',
  key,
  description,
});
const constDealProps = [
  { code: 'dealSumType', key: 'type', desc: 'Тип суммы сделки' },
  { code: 'dealSum', key: 'sum', desc: 'Общая сумма сделки' },
  { code: 'dealSumRUB', key: 'sumRUB', desc: 'Общая сумма сделки в RUB' },
  { code: 'dealSumUSD', key: 'sumUSD', desc: 'Общая сумма сделки в USD' },
  { code: 'minDealSum', key: 'minSum', desc: 'Минимальная сумма сделки' },
  {
    code: 'minDealSumRUB',
    key: 'minSumRUB',
    desc: 'Минимальная сумма сделки в RUB',
  },
  {
    code: 'minDealSumUSD',
    key: 'minSumUSD',
    desc: 'Минимальная сумма сделки в USD',
  },
  { code: 'liability', key: 'obligations', desc: 'Сумма обязательств' },
  {
    code: 'liabilityUSD',
    key: 'obligationsUSD',
    desc: 'Сумма обязательств в USD',
  },
  {
    code: 'liabilityRUB',
    key: 'obligationsRUB',
    desc: 'Сумма обязательств в RUB',
  },
  { code: 'currency', key: 'currency', desc: 'Валюта сделки' },
  {
    code: 'liabilityCurrency',
    key: 'obligationsCurrency',
    desc: 'Валюта обязательств сделки',
  },
  { code: 'currencyData', key: 'currencyData', desc: '' },
  { code: 'liabilityCurrencyData', key: 'obligationsCurrencyData', desc: '' },
  { code: 'NDSTaxValue', key: 'vat', desc: 'Размер НДС' },
  { code: 'VATIncluded', key: 'vatIncluded', desc: 'НДС' },
  { code: 'minNDSTaxValue', key: 'minVat', desc: 'Размер НДС' },
  { code: 'minVATIncluded', key: 'minVatIncluded', desc: 'НДС' },
  {
    code: 'dateCurrencyRate',
    key: 'rateDate',
    desc: 'Дата курса Банка России',
  },
  {
    code: 'dealAsset',
    key: 'type',
    desc: 'Тип актива',
  },
];

const sideProps = ['name', 'percentBCA', 'dateBCA', 'role', 'roleCode', 'isContractor', 'сontractorOGRN'];
const vatText = {
  '0': 'с учетом НДС',
  '1': 'в том числе НДС',
  '2': 'НДС не облагается',
};
const toCurrency = (value, rates, currency, toCurrency) =>
  Math.round(value * (rates[currency] / rates[toCurrency]) * 100) / 100;

export default produce((draft, { type, payload }) => {
  switch (type) {
    case actionTypes.INIT_DEAL_INFO: {
      Object.assign(draft, payload);

      if (payload.isEdit) {
        return draft;
      }
      if (draft.typical) {
        draft.sides = [];
        for (let i = 0; i < draft.rolesBySide.length; i++) {
          draft.sides.push(createSide(i, draft.rolesBySide));
        }
      } else {
        draft.sides = [createSide()];
      }

      return draft;
    }
    case actionTypes.SET_DEAL_TYPICAL: {
      draft.typical = payload;
      return draft;
    }
    case actionTypes.SET_DEAL_CONTRACT_TYPE: {
      draft.contractType = payload;
      return draft;
    }
    case actionTypes.SET_DEAL_ACTIVITY_FIELD: {
      draft.activityField = payload;
      return draft;
    }
    case actionTypes.SET_DEAL_VERSION_TYPE: {
      draft.versionType = payload;
      return draft;
    }
    case actionTypes.SET_DEAL_SUBJECT_BASIC_TYPE: {
      draft.subjectBasic.type = payload;
      return draft;
    }
    case actionTypes.SET_DEAL_SUBJECT_BASIC_TEXT: {
      draft.subjectBasic.text = payload;
      return draft;
    }
    case actionTypes.SET_DEAL_JUSTIFICATION: {
      const { name, value } = payload;
      draft.justification[name] = value;
      return draft;
    }
    case actionTypes.ADD_DEAL_SIDE: {
      draft.sides.push(createSide());
      return draft;
    }
    case actionTypes.REMOVE_DEAL_SIDE: {
      draft.sides.splice(payload, 1);
      return draft;
    }
    case actionTypes.SET_DEAL_SIDE: {
      const { side, value } = payload;
      draft.sides[side] = {
        ...draft.sides[side],
        ...rawToSide(value),
        isOg: value?.isOg === undefined ? draft.sides[side].isOg : value.isOg,
      };
      return draft;
    }
    case actionTypes.SET_DEAL_SIDE_PARAM: {
      const { side, param, value } = payload;
      draft.sides[side][param] = value;
      return draft;
    }
    case actionTypes.SET_EDIT_DEAL_SUM: {
      draft.sum = { ...draft.sum, ...payload, vat: parseFloat(payload.vat) };
      return draft;
    }
    case actionTypes.SET_DEAL_SUM: {
      const { param, value } = payload;
      draft.sum[param] = value;

      // пересчитывать сумму с НДС
      if (['sum', 'minSum', 'vat', 'minVat', 'vatIncluded', 'minVatIncluded'].includes(param)) {
        const isMin = param.startsWith('min');
        const deps = isMin
          ? { sum: 'minSum', vat: 'minVat', vatIncluded: 'minVatIncluded' }
          : { sum: 'sum', vat: 'vat', vatIncluded: 'vatIncluded' };

        draft.sum[deps.sum + 'Total'] = draft.sum[deps.vatIncluded]
          ? draft.sum[deps.sum]
          : parseFloat(draft.sum[deps.sum]) + (draft.sum[deps.sum] * draft.sum[deps.vat]) / 100;
      }
      return draft;
    }
    case actionTypes.SET_CURRENCY_RATES: {
      const { rates, date } = payload;
      draft.currencies.ratesDate = date;
      if (rates) {
        draft.currencies.rates = rates;
        draft.currencies.ratesAvailable = true;
      } else {
        draft.currencies.ratesAvailable = false;
      }
      return draft;
    }
    case actionTypes.SET_CURRENCY_RATE: {
      const { rate, currency } = payload;
      draft.currencies.rates[currency] = rate;
      return draft;
    }
    case actionTypes.PREPARE_DEAL_SUBJECT: {
      const { currencies, sides, sum, subject, roles } = draft;

      if (Array.isArray(subject.paramValues) || !subject.paramValues) {
        subject.paramValues = {};
      }

      const currency = currencies.list.find((c) => c.code === sum.currency);
      const obligationsCurrency = currencies.list.find((c) => c.code === sum.obligationsCurrency);
      const obligationsUsd = toCurrency(sum.obligations, currencies.rates, sum.obligationsCurrency, 'USD') * 1e-6;

      subject.paramValues.wizardConstant_data = {
        ...sum,
        obligationsUSD: obligationsUsd.toFixed(obligationsUsd > 1 ? 2 : 4),
        obligationsRUB: toCurrency(sum.obligations, currencies.rates, sum.obligationsCurrency, 'RUB'),
        sumUSD: toCurrency(sum.sumTotal, currencies.rates, sum.currency, 'USD'),
        sumRUB: toCurrency(sum.sumTotal, currencies.rates, sum.currency, 'RUB'),
        minSumUSD: toCurrency(sum.minSumTotal, currencies.rates, sum.currency, 'USD'),
        minSumRUB: toCurrency(sum.minSumTotal, currencies.rates, sum.currency, 'RUB'),
        currency: currency.name,
        obligationsCurrency: obligationsCurrency.name,
        currencyData: currency,
        obligationsCurrencyData: obligationsCurrency,
        rateDate: currencies.ratesDate.toLocaleDateString(),
        vatIncluded: vatText[sum.vatIncluded],
        minVatIncluded: vatText[sum.minVatIncluded],
      };

      for (const [currency, rate] of Object.entries(currencies.rates)) {
        subject.paramValues.wizardConstant_data['currencyRates' + currency] = rate;
        subject.params['wizardConstant_currencyRates' + currency] = makeConstRefProp(
          'currencyRates' + currency,
          'Курс ' + currency
        );
      }

      for (const prop of constDealProps) {
        subject.params['wizardConstant_' + prop.code] = makeConstRefProp(prop.key, prop.desc);
      }

      // стороны всегда первые
      delete subject.params.sides;
      subject.params = {
        sides: {
          type: 'switch',
          items: [],
          sides: [],
        },
        ...subject.params,
      };

      for (const [i, side] of sides.entries()) {
        const index = i + 1;
        const percentBCA = ((sum.sumTotal / side.bsa) * 100).toFixed(2);
        const dateBCA = side.bsaDate && side.bsaDate.toLocaleDateString();

        subject.params.sides.items.push({
          id: side.id,
          name: side.name,
          isContractor: !side.isOg,
          сontractorOGRN: side.ogrn,
          percentBCA: isFinite(percentBCA) && !isNaN(percentBCA) ? percentBCA || '0' : '0',
          dateBCA,
        });

        subject.params.sides.sides.push({
          code: side.role,
          name: roles[side.role].name,
        });

        for (const prop of sideProps) {
          subject.params[`sides.${index}.${prop}`] = {
            type: 'ref',
            source: 'sides',
            key: `${i}.${prop}`,
          };
        }
      }
      return draft;
    }

    case actionTypes.SET_DEAL_SUBJECT_PARAM: {
      const { param, value } = payload;
      draft.subject.paramValues[param] = value;

      if (param === 'sides') {
        draft[param] = value.map((el) => {
          return draft[param].find((item) => item.id === el.id);
        });
      }

      return draft;
    }
    default:
      return draft;
  }
}, initialState);
