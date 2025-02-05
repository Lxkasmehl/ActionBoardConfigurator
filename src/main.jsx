import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import Pidget from './components/Pidget.jsx';
import { NextUIProvider } from '@nextui-org/react';

const pidgetContainer = document.getElementById('pidgetReactContainer');

if (pidgetContainer == null) {
  const container = document.createElement('div');
  container.setAttribute('id', 'pidgetReactContainer');
  document.body.prepend(container);
}

const pidgetCSS = document.createElement('link');
pidgetCSS.setAttribute('rel', 'stylesheet');
pidgetCSS.setAttribute(
  'href',
  import.meta.env.VITE_REACT_APP_CSS_PATH + '/index.css',
);
document.head.append(pidgetCSS);

ReactDOM.createRoot(document.getElementById('pidgetReactContainer')).render(
  <React.StrictMode>
    <NextUIProvider>
      <App>
        <Pidget />
      </App>
    </NextUIProvider>
  </React.StrictMode>,
);
