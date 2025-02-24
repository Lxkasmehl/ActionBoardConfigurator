// src/index.js
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { StrictMode } from 'react';

import store from './redux/store';

import App from './App';
import { ReactFlowProvider } from '@xyflow/react';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ReactFlowProvider>
    <StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </StrictMode>
  </ReactFlowProvider>,
);
