import React from 'react';
import { render } from 'react-dom';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';

import GlobalStore from 'infra/GlobalStore';
import App from 'components/App';
import { preferenceKeys } from 'infra/const';
import { updatePreference } from 'infra/GlobalActions';

render((
  <HashRouter>
    <Provider store={GlobalStore}>
      <App />
    </Provider>
  </HashRouter>), document.getElementById('react')
);

// Load preferences from local storage
preferenceKeys.forEach(key => {
  if (localStorage[key] !== undefined) updatePreference(key, JSON.parse(localStorage[key]));
});

// Pre-load home image
const i = new Image();
i.src = '/static/img/home.jpg';
