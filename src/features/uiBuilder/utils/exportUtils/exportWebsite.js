import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generateAppJsx } from './appGenerator';
import { generatePackageJson, generateViteConfig } from './configGenerator';
import { generateReadme } from './readmeGenerator';
import { generateStoreJs, generateUiStateSlice } from './storeGenerator';
import { generateFilterArea } from './filterAreaGenerator';
import { generateButtonBar } from './buttonBarGenerator';
import { generateTableComponent } from './tableComponentGenerator';
import { generateChartComponent } from './chartComponentGenerator';
import { exportToExcel } from '../exportToExcelUtils';
import { generateColumnSelectorModal } from './columnSelectorModalGenerator';
import { generateSortModal } from './sortModalGenerator';
import { generateTextComponent } from './textComponentGenerator';

export const exportWebsite = async (
  components,
  columnData,
  tableColumns,
  componentGroups,
  tableData,
  visibleColumns,
) => {
  const zip = new JSZip();

  // Create src directory
  const src = zip.folder('src');

  // Create redux directory
  const redux = src.folder('redux');
  redux.file('store.js', generateStoreJs());
  redux.file('uiStateSlice.js', generateUiStateSlice());

  const utilsDir = src.folder('utils');
  utilsDir.file(
    'exportToExcelUtils.js',
    `import * as XLSX from 'xlsx';

export const exportToExcel = ${exportToExcel.toString()}`,
  );

  // Create components directory
  const componentsDir = src.folder('components');

  // Add custom components
  componentsDir.file('FilterArea.jsx', generateFilterArea());

  componentsDir.file('ButtonBar.jsx', generateButtonBar());

  componentsDir.file('ColumnSelectorModal.jsx', generateColumnSelectorModal());

  componentsDir.file('SortModal.jsx', generateSortModal());

  componentsDir.file('TableComponent.jsx', generateTableComponent());

  componentsDir.file('ChartComponent.jsx', generateChartComponent());

  componentsDir.file('TextComponent.jsx', generateTextComponent());

  // Add App.jsx
  src.file(
    'App.jsx',
    generateAppJsx(
      components,
      columnData,
      tableColumns,
      componentGroups,
      tableData,
      visibleColumns,
    ),
  );

  // Add main.jsx
  src.file(
    'main.jsx',
    `import React from 'react';
import ReactDOM from "react-dom/client";
import App from "./App";
import { CssVarsProvider } from "@mui/joy/styles";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CssVarsProvider>
      <App />
    </CssVarsProvider>
  </React.StrictMode>
);`,
  );

  // Add package.json
  zip.file('package.json', generatePackageJson());

  // Add vite.config.js
  zip.file('vite.config.js', generateViteConfig());

  // Add README.md
  zip.file('README.md', generateReadme());

  // Add index.html
  zip.file(
    'index.html',
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Exported Website</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
  );

  // Generate and download ZIP
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'exported-website.zip');
};
