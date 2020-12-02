import { applyMiddleware, createStore } from 'redux';
import { logger } from 'redux-logger';
import { routerMiddleware } from 'react-router-redux';
import { createBrowserHistory as createHistory } from 'history';
import createSagaMiddleware from 'redux-saga'

import reducer from './reducers';
import sagas from './sagas';

export const history = createHistory();
const sagaMiddleware = createSagaMiddleware()

const myRouterMiddleware = routerMiddleware(history);

const getMiddleware = () => {
  if (process.env.NODE_ENV === 'production') {
      return applyMiddleware(myRouterMiddleware, sagaMiddleware);
  } else {
      return applyMiddleware(myRouterMiddleware, sagaMiddleware, logger);
  }
}

export const store = createStore(reducer, getMiddleware());

sagaMiddleware.run(sagas);
