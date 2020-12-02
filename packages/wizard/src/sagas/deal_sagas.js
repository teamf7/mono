import { call, put, select, takeEvery } from 'redux-saga/effects';

import { fetchJson } from '../util/util';
import server from '../util/server';
import { types } from '../actions';

import {
  dealCurrenciesSelector,
  dealSubjectSelector,
  dealSidesSelector,
  dealSumSelector,
  dealTargetSelector,
  dealRedirectUrlSelector,
  getDealId,
  getPath,
  getBreadcrumb,
  getStatus,
  getDealTypical,
  getDealActivityField,
  getDealVersionType,
  getDealSubjectBasic,
  getDealContractType,
  getDealJustification,
} from '../reselect';
import { WizardQuestionText } from '../components/elements/question_text';

// Инициализация сделки после выбора с форм
function* startDeal({ payload }) {
  try {
    let urlSettings = server + '/API/internal/v1/wizard_settings_deal.php';

    if (payload.typical) {
      urlSettings += '?id=' + payload.target.id;
    }

    const settings = yield call(fetchJson, urlSettings);
    const {
      currencies,
      vats = [
        // с бека не приходит потому что причины, потом выпилить
        { name: 'С учетом НДС', code: '0' },
        { name: 'Без учета НДС', code: '1' },
        { name: 'НДС не облагается', code: '2' },
      ],
      rates,
      redirectUrl,
      subject,
    } = settings;

    const availableRoles = payload.typical ? payload.roles.map((r) => r.split('|')) : [];

    // преобразование из массива в объект по кодам
    const roles = settings.roles.reduce((res, current) => {
      current.opposition = [];
      res[current.code] = current;
      return res;
    }, {});

    // собираем список ролей, доступных для каждой стороны
    const rolesBySide = [];
    for (const option of availableRoles) {
      for (const [side, role] of option.entries()) {
        if (!rolesBySide[side]) {
          rolesBySide[side] = [];
        }
        if (side > 0) {
          roles[option[side - 1]].opposition.push(role);
        }
        rolesBySide[side].push(role);
      }
    }
    // только уникальные
    for (const side in rolesBySide) {
      rolesBySide[side] = [...new Set(rolesBySide[side])];
    }
    yield put({
      type: types.INIT_DEAL_INFO,
      payload: {
        roles,
        rolesBySide,
        currencies: {
          list: currencies,
          rates,
          ratesDate: new Date(settings.rateDate),
          ratesAvailable: !!rates,
        },
        vats,
        redirectUrl,
        subject,
      },
    });

    yield put({ type: types.ADD_BREADCUMB, payload: { id: payload.id, text: payload.text } });
    const header = payload.typical ? String(payload.text).toLowerCase() : (yield select(getDealActivityField))?.name;
    yield put({
      type: types.NEXT_STEP,
      payload: {
        type: 'deal_side',
        header,
        id: 0,
      },
    });
  } catch (e) {
    yield put({ type: 'START_DEAL_FAILED', message: e.message });
  }
}

function* fetchCurrencyRates({ payload }) {
  const url = server + '/API/internal/v1/currency_rate.php?';

  const currencies = yield select(dealCurrenciesSelector);
  const allCurrencies = currencies.list.map((c) => c.code).join(',');
  const params = `currency=${allCurrencies}&date=${payload.getTime() / 1000}&forCurrency=USD`;

  const res = yield call(fetchJson, url + params);

  yield put({ type: types.SET_CURRENCY_RATES, payload: { rates: res.rates, date: payload } });
}

function* goToDealSubject() {
  const typical = yield select(getDealTypical);
  if (typical) {
    yield put({ type: types.PREPARE_DEAL_SUBJECT });
    yield put({ type: types.NEXT_STEP_SUCCEEDED, payload: { type: 'deal_subject' } });
  } else {
    yield put({ type: types.NEXT_STEP_SUCCEEDED, payload: { type: 'deal_subject_basic' } });
  }
}
// сохранение сделки и выход из визарда
function* saveDeal() {
  const path = yield select(getPath);
  const status = yield select(getStatus);

  if (path !== 'deal') {
    return;
  }
  if (status === 'edit') {
    yield put({ type: types.PREPARE_DEAL_SUBJECT });
  }

  const breadcrumb = yield select(getBreadcrumb);
  const dealId = yield select(getDealId);
  const sides = yield select(dealSidesSelector);
  const sum = yield select(dealSumSelector);
  const target = yield select(dealTargetSelector);
  const currencies = yield select(dealCurrenciesSelector);
  const versionType = yield select(getDealVersionType);
  const typical = yield select(getDealTypical);
  const justification = yield select(getDealJustification);

  let post = {
    sides,
    sum,
    breadcrumb,
    rateDate: currencies.ratesDate,
    rates: currencies.rates,
    target: target,
    versionType,
    typical,
    justification
  };

  if (dealId) {
    post.dealId = dealId;
  }

  if (typical) {
    const subject = yield select(dealSubjectSelector);
    post.id = subject.id;
    post.text = WizardQuestionText({
      text: subject.text,
      paramsList: subject.params,
      values: subject.paramValues,
      textReturn: true,
    }).join(' ');
    post.title = WizardQuestionText({
      text: subject.title,
      paramsList: subject.params,
      values: subject.paramValues,
      textReturn: true,
      isTitle: true,
    }).join(' ');
    post.values = subject.paramValues;
  } else {
    const subject = yield select(getDealSubjectBasic);
    post.text = subject.text;
    post.type = subject.type;
    const contractType = yield select(getDealContractType);
    post.contractType = contractType?.id;
    const activityField = yield select(getDealActivityField);
    post.activityField = activityField?.id;
  }

  const result = yield call(fetchJson, server + '/API/internal/v1/wizard_save.php?type=dealSubject', {
    method: 'post',
    body: JSON.stringify(post),
  });
  const redirectUrl = yield select(dealRedirectUrlSelector);
  if (result && result.ID) {
    window.location = redirectUrl + result.ID + '/';
  }
}

function* dealEdit({ payload }) {
  try {
    const url = server + '/API/internal/v1/wizard_edit_deal.php';
    const res = yield call(fetchJson, url + '?id=' + payload.id);

    const {
      currencies,
      vats = [
        // с бека не приходит потому что причины, потом выпилить
        { name: 'С учетом НДС', code: '0' },
        { name: 'Без учета НДС', code: '1' },
        { name: 'НДС не облагается', code: '2' },
      ],
      rates,
      redirectUrl,
      subject,
      target,
    } = res;

    const firstSideOptions = res.firstSide.map((o) => ({ ...o, name: o.UF_SNAME }));

    const availableRoles = res.availableRoles.map((r) => r.split('|'));

    const sides = res.sides.map((s) => ({ ...s, bsaDate: new Date(s.bsaDate) }));
    // преобразование из массива в объект по кодам
    const roles = res.roles.reduce((res, current) => {
      current.opposition = [];
      res[current.code] = current;
      return res;
    }, {});

    // собираем список ролей, доступных для каждой стороны
    const rolesBySide = [];
    for (const option of availableRoles) {
      for (const [side, role] of option.entries()) {
        if (!rolesBySide[side]) {
          rolesBySide[side] = [];
        }
        if (side > 0) {
          roles[option[side - 1]].opposition.push(role);
        }
        rolesBySide[side].push(role);
      }
    }
    // только уникальные
    for (const side in rolesBySide) {
      rolesBySide[side] = [...new Set(rolesBySide[side])];
    }

    yield put({
      type: types.INIT_DEAL_INFO,
      payload: {
        isEdit: true,
        roles,
        rolesBySide,
        sides,
        firstSideOptions,
        currencies: {
          list: currencies,
          rates,
          ratesDate: new Date(res.rateDate),
          ratesAvailable: !!rates,
        },
        vats,
        redirectUrl,
        subject,
        target,
      },
    });

    if (res.sum) {
      yield put({
        type: types.SET_EDIT_DEAL_SUM,
        payload: res.sum,
      });
    }

    yield put({
      type: types.NEXT_STEP,
      payload: {
        type: 'deal_side',
        id: 0,
      },
    });
  } catch (e) {
    console.warn(e);
  }
}

function* afterDealStart() {
  const typical = yield select(getDealTypical);
  if (typical) {
    yield put({
      type: types.NEXT_STEP,
      payload: {
        type: 'form',
      },
    });
  } else {
    yield put({
      type: types.START_DEAL,
      payload: { typical },
    });
  }
}

export default function* dealSaga() {
  yield takeEvery(types.START_DEAL, startDeal);
  yield takeEvery(types.NEXT_AFTER_DEAL_START, afterDealStart);
  yield takeEvery(types.FETCH_CURRENCY_RATES, fetchCurrencyRates);
  yield takeEvery(types.GO_TO_DEAL_SUBJECT, goToDealSubject);
  yield takeEvery(types.SAVE_DEAL, saveDeal);
  yield takeEvery(types.DEAL_EDIT, dealEdit);
  yield takeEvery(types.SAVE, saveDeal);
}
