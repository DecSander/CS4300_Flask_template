import React from 'react';
import { render } from 'react-dom';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';

import GlobalStore from 'infra/GlobalStore';
import App from 'components/App';
import { requestPreferences } from 'infra/api';

requestPreferences();

render((
  <HashRouter>
    <Provider store={GlobalStore}>
      <App />
    </Provider>
  </HashRouter>), document.getElementById('react')
);
