import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generateAppJsx } from './appGenerator';
import { generatePackageJson, generateViteConfig } from './configGenerator';
import { generateReadme } from './readmeGenerator';
import { generateStoreJs, generateUiStateSlice } from './storeGenerator';

export const exportWebsite = async (
  components,
  columnData,
  tableColumns,
  componentGroups,
) => {
  const zip = new JSZip();

  // Create src directory
  const src = zip.folder('src');

  // Create redux directory
  const redux = src.folder('redux');
  redux.file('store.js', generateStoreJs());
  redux.file('uiStateSlice.js', generateUiStateSlice());

  // Create components directory
  const componentsDir = src.folder('components');

  // Add custom components
  componentsDir.file(
    'FilterArea.jsx',
    `import React from 'react';
import { FormLabel, Autocomplete } from '@mui/joy';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedFilterOptions } from '../redux/uiStateSlice';

export default function FilterArea({ componentId, fields, columnData, tableColumns, componentGroups }) {
  const dispatch = useDispatch();
  const selectedFilters = useSelector((state) => state.uiState.selectedFilters);

  const componentGroup = Object.values(componentGroups).find((group) =>
    group.components.includes(componentId),
  );

  const tableComponentId = componentGroup?.components?.find(
    (id) => tableColumns[id],
  );

  const handleFilterChange = (filter, newValue) => {
    dispatch(
      setSelectedFilterOptions({
        tableComponentId,
        options: {
          ...selectedFilters[componentId],
          [filter.label]: newValue,
        },
      }),
    );
  };

  return (
    <div style={{ position: 'relative', marginBottom: '2rem' }}>
      <div
        style={{
          display: 'grid',
          gap: '1rem',
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
              value={selectedFilters[tableComponentId]?.[filter.label] || []}
              onChange={(event, newValue) => handleFilterChange(filter, newValue)}
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
import {
  Button,
  IconButton,
  Autocomplete,
  Menu,
  MenuItem,
  Dropdown,
  MenuButton,
} from '@mui/joy';
import * as Icons from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { applyFilters, clearFilters } from '../redux/uiStateSlice';

export default function ButtonBar({ fields, componentId, componentGroups, tableColumns }) {
  const dispatch = useDispatch();
  let IconComponent;

  const componentGroup = Object.values(componentGroups).find((group) =>
    group.components.includes(componentId),
  );

  const tableComponentId = componentGroup?.components?.find(
    (id) => tableColumns[id],
  );

  const handleButtonClick = (field) => {
    switch (field['text/icon']) {
      case 'Apply filter':
        dispatch(applyFilters({ tableComponentId }));
        break;
      case 'Clear all filter':
        dispatch(clearFilters({ tableComponentId }));
        break;
      case 'Sort':
        dispatch(setSortModalOpen({ isOpen: true, componentId }));
        break;
      case 'Column Selector':
        dispatch(setColumnSelectorModalOpen({ isOpen: true, componentId }));
        break;
      case 'Export':
        if (field.menuItem?.label === 'All columns') {
          exportToExcel(tableData, null, null, 'table_export.xlsx');
        } else if (field.menuItem?.label === 'Only visible columns') {
          exportToExcel(tableData, visibleColumns, tableColumns, 'table_export_visible_columns.xlsx');
        }
        break;
      default:
        if (field.onClick) {
          field.onClick();
        }
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
      {fields.map((field, index) => {
        const commonProps = {
          size: 'sm',
          variant: field.variant || 'solid',
          color: field.color || 'primary',
        };

        const renderField = () => {
          switch (field.type) {
            case 'iconButton':
              IconComponent = Icons[field['text/icon']];
              return (
                <div>
                  <IconButton {...commonProps} color='primary' 
                  onClick={() => handleButtonClick(field)}>
                    <IconComponent />
                  </IconButton>
                </div>
              );
            case 'autocomplete':
              return (
                <div>
                  <Autocomplete
                    {...commonProps}
                    placeholder={field['text/icon']}
                    options={[]}
                    sx={{
                      width: '170px',
                    }}
                  />
                </div>
              );
            case 'menu':
              return (
                <div>
                  <Dropdown>
                    <MenuButton {...commonProps}>{field['text/icon']}</MenuButton>
                    <Menu>
                      {field.menuItems?.map((item, index) => (
                        <MenuItem
                          {...commonProps}
                          color='neutral'
                          key={index}
                          onClick={() => handleButtonClick(field, item)}
                        >
                          {item.label}
                        </MenuItem>
                      ))}
                    </Menu>
                  </Dropdown>
                </div>
              );
            case 'button':
            default:
              return (
                <div>
                  <Button {...commonProps} 
                  onClick={() => handleButtonClick(field)}>
                    {field['text/icon']}
                  </Button>
                </div>
              );
          }
        };

        return renderField();
      })}
    </div>
  );
}`,
  );

  componentsDir.file(
    'TableComponent.jsx',
    `import React from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';

const theme = createTheme({
  components: {
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(224, 224, 224, 1)',
        },
        cell: {
          borderRight: '1px solid rgba(224, 224, 224, 1)',
          '&:last-child': {
            borderRight: 'none',
          },
        },
        columnHeaders: {
          borderBottom: '1px solid rgba(224, 224, 224, 1)',
          borderTop: '1px solid rgba(224, 224, 224, 1)',
        },
        columnHeader: {
          borderRight: '1px solid rgba(224, 224, 224, 1)',
          '&:last-child': {
            borderRight: 'none',
          },
        },
        row: {
          '&:last-child .MuiDataGrid-cell': {
            borderBottom: 'none',
          },
        },
      },
    },
  },
});

export default function TableComponent({ componentId, columnData, tableColumns }) {
  const appliedFilters = useSelector((state) => state.uiState.appliedFilters[componentId] || {});
  const columns = tableColumns[componentId];
  const data = columnData[componentId];

  // Transform the data into rows for DataGrid
  const rows = [];
  if (data && Object.keys(data).length > 0) {
    const rowCount = data[columns[0].label].length;
    for (let i = 0; i < rowCount; i++) {
      const row = {
        id: i,
        ...columns.reduce((acc, column) => {
          acc[column.label] = data[column.label][i];
          return acc;
        }, {})
      };
      
      // Apply filters - now properly handles multiple filters
      const shouldIncludeRow = Object.entries(appliedFilters).every(([columnName, filterValues]) => {
        if (!filterValues || filterValues.length === 0) return true;
        const rowValue = row[columnName];
        return filterValues.some(value => value === rowValue);
      });

      if (shouldIncludeRow) {
        rows.push(row);
      }
    }
  }

  // Transform columns for DataGrid
  const gridColumns = columns.map(column => ({
    field: column.label,
    headerName: column.label,
    editable: false,
    flex: 1,
    minWidth: 100,
    resizable: true,
    sortable: true,
    filterable: true,
  }));
  
  return (
    <ThemeProvider theme={theme}>
      <div style={{ height: 500, width: '100%', overflow: 'auto' }}>
        <DataGridPro
          rows={rows}
          columns={gridColumns}
          disableRowSelectionOnClick
          columnReordering={false}
          experimentalFeatures={{ newEditingApi: true }}
          hideFooter
        />
      </div>
    </ThemeProvider>
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
