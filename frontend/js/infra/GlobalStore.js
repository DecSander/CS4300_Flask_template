import { createStore } from 'redux';
import GlobalReducer from 'infra/GlobalReducer';

export default createStore(
  GlobalReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
