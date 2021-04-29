import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import App from './pages/App';
import reportWebVitals from './reportWebVitals';

import { Web3ReactProvider } from '@web3-react/core';
import { getWeb3Library } from './web3';
import Web3Context from './web3/context';

import './utils/load-chain-data';
import { Provider } from 'react-redux';
import store from './store';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Web3ReactProvider getLibrary={getWeb3Library}>
        <Web3Context>
          <App />
        </Web3Context>
      </Web3ReactProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
