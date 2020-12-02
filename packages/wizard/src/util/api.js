import { isLocal } from '../components/wizard';
import {
  SET_DEAL_SUBJECT,
  SET_FORMS,
  SET_QUESTION_GROUP, SETUP_DEAL,
  SETUP_IP,
} from './wizard_reducer';
import { prepareQuestionJson } from 'util';

export function initIP(dispatch, newStep) {
  const url = isLocal
    ? '/settings.json'
    : 'http://172.30.48.151/API/internal/v1/wizard_settings.php';
  fetchJson(url).then((result) => {
    dispatch({
      type: SETUP_IP,
      data: result,
    });
    newStep({ type: 'settings' });
  });
}

export function fetchForms(ogId, dispatch) {
  const url = isLocal
     ? '/wizard.json'
    : 'http://172.30.48.151/API/internal/v1/wizard_forms.php';

  fetchJson(url + '?ogId=' + ogId).then((result) => {
    dispatch({
      type: SET_FORMS,
      data: result,
    });
  });
}


export function fetchQuestionGroup(groupId, ogId, dispatch) {
  const url = isLocal
    ? '/questions.json'
    : 'http://172.30.48.151/API/internal/v1/wizard_questions.php';

  fetchJson(url + '?ogId=' + ogId + '&group=' + groupId).
    then((result) => {
      result = prepareQuestionJson(result);
      dispatch({
        type: SET_QUESTION_GROUP,
        id: groupId,
        data: result,
      });
    });
}

function preloaderInitialization() {
  // Счетчик общего количества закончившихся с ошибкой запросов/ресурсоемких задач в приложении
  let errorRequests = 0;
  // Счетчик общего количества выполняющихся запросов/ресурсоемких задач в приложении
  let pendingRequests = 0;
  const subsribers = [];
  const delay = 100;

  return function state (hidePreloader) {
    return {
      // отображать загрузку
      isLoading: () => (pendingRequests - errorRequests) > 0,
      // начало загрузки
      startRequest: (d = delay) => {
        if (hidePreloader) return;
        // delay - задержка перед отоюражением спинера/для того, чтобы не было бликов (если быстрый интернет)
        setTimeout(() => {
          pendingRequests++;
          const isLoading = state().isLoading();
          subsribers.forEach(cb => {
            cb(isLoading);
          });
        }, d);
      },
      // успешная загрузка
      successRequest: () => {
        if (hidePreloader) return;
        pendingRequests--;
        const isLoading = state().isLoading();
        subsribers.forEach(cb => {
          cb(isLoading);
        });
      },
      // загрузка с ошибкой
      errorRequest: () => {
        if (hidePreloader) return;
        errorRequests++;
        const isLoading = state().isLoading();
        subsribers.forEach(cb => {
          cb(isLoading);
        });
      },
      // подписка
      subscribe: (cb) => {
        subsribers.push(cb);
      },
      // отписка
      unsubscribe: () => {
        subsribers.unshift();
      }
    }
  }
}

const preloaderState = preloaderInitialization();

function fetchJson(url, params = {}) {
  const { startRequest, successRequest, errorRequest } = preloaderState(params?.hidePreloader);
  startRequest();
  return fetch(url, params)
    .then((response) => {
      const res = response.json();
      successRequest();
      return res;
    })
    .catch((e) => {
      errorRequest();
      console.log('fetchJson error, url: ' + url + ' \n: ' + e);
    });
}

export {
  preloaderInitialization,
  preloaderState,
  fetchJson
};
