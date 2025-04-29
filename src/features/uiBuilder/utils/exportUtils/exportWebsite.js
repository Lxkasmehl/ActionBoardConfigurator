import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generateAppJsx } from './appGenerator';
import { generatePackageJson, generateViteConfig } from './configGenerator';
import { generateReadme } from './readmeGenerator';

export const exportWebsite = async (
  components,
  columnData,
  tableColumns,
  componentGroups,
) => {
  const zip = new JSZip();

  // Create src directory
  const src = zip.folder('src');

  // Create components directory
  const componentsDir = src.folder('components');

  // Add custom components
  componentsDir.file(
    'FilterArea.jsx',
    `import React from 'react';
import { FormLabel, Autocomplete } from '@mui/joy';

export default function FilterArea({ componentId, fields, columnData, tableColumns, componentGroups }) {

    const componentGroup = Object.values(componentGroups).find((group) =>
      group.components.includes(componentId),
    );

    const tableComponentId = componentGroup?.components?.find(
      (id) => tableColumns[id],
    );

  /* (event, newValue) => {
              dispatch(
                setSelectedFilterOptions({
                  groupName,
                  options: {
                    ...currentSelectedOptions,
                    [filter.id]: newValue,
                  },
                }),
              );
            } */

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          display: 'grid',
          gap: '0.5rem',
          marginBottom: '0.5rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))'
        }}
      >
        {fields.map((filter, index) => (
          <div
            key={index}
            style={{
              display: 'grid',
              gap: '0.25rem',
              position: 'relative',
              maxWidth: '300px'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: '0.5rem' }}>
              <FormLabel
                size='sm'
                sx={{
                  maxWidth: '140px',
                  wordWrap: 'break-word',
                  whiteSpace: 'normal',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'block',
                  lineHeight: '1.2',
                  cursor: 'default'
                }}
              >
                {filter.label}
              </FormLabel>
            </div>
            <Autocomplete
              size='sm'
              placeholder='Select an option'
              options={(
                columnData[tableComponentId]?.[filter.label] || []
              ).filter((option) => option !== undefined)}
              getOptionLabel={(option) => option.toString() || ''}
              multiple
              value={[]}
              onChange={() => {}}
            />
          </div>
        ))}
      </div>
    </div>
  );
}`,
  );

  componentsDir.file(
    'ButtonBar.jsx',
    `import React from 'react';
import { Button, Stack } from '@mui/joy';

export default function ButtonBar({ fields }) {
  return (
    <Stack 
      direction="row" 
      spacing={2}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: '0.5rem'
      }}
    >
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
    <Sheet 
      variant="outlined" 
      sx={{ 
        borderRadius: 'sm',
        width: '100%',
        overflow: 'auto'
      }}
    >
      <Table
        sx={{
          '& th, & td': {
            padding: '0.75rem',
            textAlign: 'left',
            borderBottom: '1px solid',
            borderColor: 'divider'
          },
          '& th': {
            fontWeight: 'bold',
            backgroundColor: 'background.level1'
          }
        }}
      >
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
    <Box 
      sx={{ 
        padding: 2, 
        border: '1px solid', 
        borderColor: 'divider', 
        borderRadius: 'sm',
        width: '100%'
      }}
    >
      <Typography level="h4" sx={{ marginBottom: 2 }}>Chart</Typography>
      <Box 
        sx={{ 
          height: 300, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'background.level1',
          borderRadius: 'sm'
        }}
      >
        <Typography>Chart visualization would go here</Typography>
      </Box>
    </Box>
  );
}`,
  );

  // Add App.jsx
  src.file(
    'App.jsx',
    generateAppJsx(components, columnData, tableColumns, componentGroups),
  );

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
