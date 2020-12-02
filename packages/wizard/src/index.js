import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';

import 'react-datepicker/dist/react-datepicker.css';
import './styles/index.css';
import Wizard from './components/wizard';
import App from './components/app';
import { store } from './store';

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <Switch>
        <Route exact path="/" component={Wizard} />
        <Route path="/:type/:status/:ogId/:typeId/" component={App} />
        <Route path="/:type/:status/:id" component={App} />
        <Route path="/:type" component={App} />
      </Switch>
    </Router>
  </Provider>,
  document.getElementById('root')
);
