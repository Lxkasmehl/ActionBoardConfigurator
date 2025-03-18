import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Layout from '../shared/components/Layout';
import UiBuilder from '../features/uiBuilder/components/uiBuilder';
import EntityExplorer from '../features/entityExplorer/components/EntityExplorer';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <App />,
      },
      {
        path: '/entity-explorer',
        element: <EntityExplorer />,
      },
      {
        path: '/ui-builder',
        element: <UiBuilder />,
      },
      {
        path: '*',
        element: <div>Page not found</div>,
      },
    ],
  },
]);
