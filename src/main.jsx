// src/index.tsx|js
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { Provider } from 'react-redux';
import { ReactFlowProvider } from '@xyflow/react';
import { RouterProvider } from 'react-router-dom';
import store from './redux/store';
import { router } from './routes';
import {
  CssVarsProvider as JoyCssVarsProvider,
  extendTheme,
} from '@mui/joy/styles';

const joyTheme = extendTheme({
  components: {
    JoyAutocomplete: {
      styleOverrides: {
        root: {
          inset: '0px auto auto 0px !important',
        },
      },
    },
  },
});

const container = document.getElementById('pidgetReactContainer');
if (container) {
  ReactDOM.createRoot(container).render(
    <JoyCssVarsProvider theme={joyTheme}>
      <ReactFlowProvider>
        <StrictMode>
          <Provider store={store}>
            <RouterProvider router={router} />
          </Provider>
        </StrictMode>
      </ReactFlowProvider>
    </JoyCssVarsProvider>,
  );
}
