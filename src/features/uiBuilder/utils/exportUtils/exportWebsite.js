import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generateAppJsx } from './appGenerator';
import { generatePackageJson, generateViteConfig } from './configGenerator';
import { generateReadme } from './readmeGenerator';

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
