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
${muiImports}
${customImports}

function App() {
  const tableData = {
    headers: ['Column 1', 'Column 2', 'Column 3'],
    rows: [
      ['Data 1', 'Data 2', 'Data 3'],
      ['Data 4', 'Data 5', 'Data 6'],
      ['Data 7', 'Data 8', 'Data 9']
    ]
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 2 }}>
${componentCode}
    </Box>
  );
}

export default App;`;
};
