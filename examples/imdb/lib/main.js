import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './component/App';
import actions from './actions';


window.bootMoviesApp = () => {
  ReactDOM.render(<App />, document.getElementById('content'));
  actions.boot();
};
