import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const generateComponentCode = (component) => {
  const { type, props } = component;

  switch (type) {
    case 'heading':
      return `<Typography level="${props.level || 'h2'}">${props.text}</Typography>`;
    case 'paragraph':
      return `<Typography>${props.text}</Typography>`;
    case 'button':
      return `<Button variant="${props.variant}" color="${props.color}">${props.text}</Button>`;
    case 'image':
      return `<img src="${props.src}" alt="${props.alt}" style={{ maxWidth: '100%', height: 'auto' }} />`;
    case 'filterArea':
      return `<FilterArea fields={${JSON.stringify(props.fields)}} />`;
    case 'buttonBar':
      return `<ButtonBar fields={${JSON.stringify(props.fields)}} />`;
    case 'table':
      // return `<TableComponent data={${JSON.stringify(props.data)}} />`;
      return `<TableComponent data={tableData} />`;
    case 'chart':
      return `<ChartComponent data={${JSON.stringify(props.data)}} />`;
    default:
      return '';
  }
};

const generateAppJsx = (components) => {
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
    .map((component) => `      ${generateComponentCode(component)}`)
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

const generatePackageJson = () => {
  return `{
  "name": "exported-website",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@mui/joy": "^5.0.0-beta.51",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}`;
};

const generateViteConfig = () => {
  return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
});`;
};

const generateReadme = () => {
  return `# Exported Website

This is a React application exported from WebAppConfigurator.

## How to Run

### Development
1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
2. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`
3. Open http://localhost:3000 in your browser

### Production Build
1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
2. Build the application:
   \`\`\`bash
   npm run build
   \`\`\`
3. Preview the production build:
   \`\`\`bash
   npm run preview
   \`\`\`
4. The built files will be in the \`dist\` directory
5. You can serve these files using any static file server

## Project Structure
- \`src/App.jsx\`: Main application component
- \`src/main.jsx\`: Application entry point
- \`index.html\`: HTML template
- \`vite.config.js\`: Vite configuration
- \`package.json\`: Project configuration and dependencies

## Dependencies
- React 18
- Material-UI Joy
- Vite
`;
};

export const exportWebsite = async (components) => {
  const zip = new JSZip();

  // Create src directory
  const src = zip.folder('src');

  // Create components directory
  const componentsDir = src.folder('components');

  // Add custom components
  componentsDir.file(
    'FilterArea.jsx',
    `import React from 'react';
import { Box, Typography } from '@mui/joy';

export default function FilterArea({ fields }) {
  return (
    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 'sm' }}>
      <Typography level="h4" mb={2}>Filter Area</Typography>
      {fields.map((field, index) => (
        <Box key={index} mb={2}>
          <Typography level="body-sm" mb={1}>{field.label}</Typography>
          {/* Add your filter field implementation here */}
        </Box>
      ))}
    </Box>
  );
}`,
  );

  componentsDir.file(
    'ButtonBar.jsx',
    `import React from 'react';
import { Button, Stack } from '@mui/joy';

export default function ButtonBar({ fields }) {
  return (
    <Stack direction="row" spacing={2}>
      {fields.map((field, index) => (
        <Button key={index} variant="outlined" color="neutral">
          {field.label}
        </Button>
      ))}
    </Stack>
  );
}`,
  );

  componentsDir.file(
    'TableComponent.jsx',
    `import React from 'react';
import { Table, Sheet } from '@mui/joy';

export default function TableComponent({ data }) {
  return (
    <Sheet variant="outlined" sx={{ borderRadius: 'sm' }}>
      <Table>
        <thead>
          <tr>
            {data.headers?.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows?.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </Sheet>
  );
}`,
  );

  componentsDir.file(
    'ChartComponent.jsx',
    `import React from 'react';
import { Box, Typography } from '@mui/joy';

export default function ChartComponent({ data }) {
  return (
    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 'sm' }}>
      <Typography level="h4" mb={2}>Chart</Typography>
      {/* Add your chart implementation here */}
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Chart visualization would go here</Typography>
      </Box>
    </Box>
  );
}`,
  );

  // Add App.jsx
  src.file('App.jsx', generateAppJsx(components));

  // Add main.jsx
  src.file(
    'main.jsx',
    `import React from 'react';
import { jsxDEV } from "react/jsx-dev-runtime";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CssVarsProvider } from "@mui/joy/styles";

ReactDOM.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxDEV(React.StrictMode, { 
    children: /* @__PURE__ */ jsxDEV(CssVarsProvider, { 
      children: /* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
        fileName: "C:/Users/LukasMehl/Downloads/exported-website (9)/src/main.jsx",
        lineNumber: 7,
        columnNumber: 5
      })
    }, void 0, false, {
      fileName: "C:/Users/LukasMehl/Downloads/exported-website (9)/src/main.jsx",
      lineNumber: 6,
      columnNumber: 5
    })
  }, void 0, false, {
    fileName: "C:/Users/LukasMehl/Downloads/exported-website (9)/src/main.jsx",
    lineNumber: 5,
    columnNumber: 3
  })
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
