import { createHashRouter } from 'react-router-dom';
import App from '../App';
import Layout from '../shared/components/Layout';
import UiBuilder from '../features/uiBuilder/components/uiBuilder';
import DataPicker from '../features/dataPicker/components/DataPicker';

export const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <App />,
      },
      {
        path: '/data-picker',
        element: <DataPicker />,
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

/*
Die URLs werden jetzt so aussehen:
https://hcm-eu20.hr.cloud.sap/your-app-path/#/ für die Hauptseite
https://hcm-eu20.hr.cloud.sap/your-app-path/#/data-picker für den Data Picker
https://hcm-eu20.hr.cloud.sap/your-app-path/#/ui-builder für den UI Builder
*/
