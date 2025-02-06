// src/index.js
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { StrictMode } from 'react';

import store from './redux/store';

import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
