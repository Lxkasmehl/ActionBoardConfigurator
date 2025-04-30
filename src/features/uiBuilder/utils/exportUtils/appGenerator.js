import { generateComponentCode } from './componentGenerator';

export const generateAppJsx = (
  components,
  columnData,
  tableColumns,
  componentGroups,
) => {
  const componentImports = new Set();
  const customComponentImports = new Set();

  components.forEach((component) => {
    switch (component.type) {
      case 'heading':
      case 'paragraph':
        componentImports.add('Typography');
        break;
      case 'button':
        componentImports.add('Button');
        break;
      case 'filterArea':
        customComponentImports.add('FilterArea');
        break;
      case 'buttonBar':
        customComponentImports.add('ButtonBar');
        break;
      case 'table':
        customComponentImports.add('TableComponent');
        break;
      case 'chart':
        customComponentImports.add('ChartComponent');
        break;
    }
  });

  const muiImports = Array.from(componentImports)
    .map((component) => `import { ${component} } from '@mui/joy';`)
    .join('\n');

  const customImports = Array.from(customComponentImports)
    .map((component) => `import ${component} from './components/${component}';`)
    .join('\n');

  const componentCode = components
    .map(
      (component) =>
        `${generateComponentCode(component, columnData, tableColumns, componentGroups)}`,
    )
    .join('\n');

  return `import React from 'react';
import { Box } from '@mui/joy';
import { Provider } from 'react-redux';
import store from './redux/store';
${muiImports}
${customImports}

function App() {
  return (
    <Provider store={store}>
      <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 2 }}>
${componentCode}
      </Box>
    </Provider>
  );
}

export default App;`;
};
