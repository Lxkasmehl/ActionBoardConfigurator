// src/index.js
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { StrictMode } from 'react';
import store from './redux/store';
import { ReactFlowProvider } from '@xyflow/react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/index';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ReactFlowProvider>
    <StrictMode>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </StrictMode>
  </ReactFlowProvider>,
);
