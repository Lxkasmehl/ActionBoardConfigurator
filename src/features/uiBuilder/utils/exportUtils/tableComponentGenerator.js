export const generateTableComponent = () => {
  return `import React, { useMemo, useState, useEffect } from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';

// API Configuration
const API_USER = import.meta.env.VITE_API_USER;
const API_PASSWORD = import.meta.env.VITE_API_PASSWORD;

// URL Utilities
const urlUtils = {
  fixedEncodeURIComponent: (str) => {
    return encodeURIComponent(str).replace(/[!'()*]/g, (c) => {
      return '%' + c.charCodeAt(0).toString(16);
    });
  }
};

// OData Query Utilities
const queryUtils = {
  convertFilterToOData: (filter) => {
    if (!filter) return '';
    
    if (filter.operator === 'and' || filter.operator === 'or') {
      const conditions = filter.conditions
        .map(condition => this.convertFilterToOData(condition))
        .filter(Boolean);
      return conditions.length > 0 ? \`(\${conditions.join(\` \${filter.operator} \`)})\` : '';
    }
    
    if (filter.field && filter.operator && filter.value !== undefined) {
      const field = filter.field;
      const value = typeof filter.value === 'string' ? \`'\${filter.value}'\` : filter.value;
      
      switch (filter.operator) {
        case 'eq': return \`\${field} eq \${value}\`;
        case 'ne': return \`\${field} ne \${value}\`;
        case 'gt': return \`\${field} gt \${value}\`;
        case 'ge': return \`\${field} ge \${value}\`;
        case 'lt': return \`\${field} lt \${value}\`;
        case 'le': return \`\${field} le \${value}\`;
        case 'contains': return \`contains(\${field},\${value})\`;
        default: return '';
      }
    }
    
    return '';
  }
};

// Request Manager for rate limiting
const requestManager = {
  maxConcurrent: 3,
  currentRequests: 0,
  queue: [],
  
  async waitForOpenSlot() {
    if (this.currentRequests < this.maxConcurrent) {
      this.currentRequests++;
      return;
    }
    
    return new Promise(resolve => {
      this.queue.push(resolve);
    });
  },
  
  releaseSlot() {
    this.currentRequests--;
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      this.currentRequests++;
      next();
    }
  }
};

// Custom hook for sending requests
const useSendRequest = () => {
  return async (_, configEntries) => {
    try {
      const headers = new Headers();
      headers.set('Authorization', 'Basic ' + btoa(\`\${API_USER}:\${API_PASSWORD}\`));
      headers.set('X-SF-Correlation-Id', crypto.randomUUID());
      headers.set('successfactors-sourcetype', 'Application');
      headers.set('Accept', 'application/json');

      const requests = configEntries.map(async ([_, config]) => {
        const allResults = [];
        let skip = 0;
        const top = 100;
        let hasMoreResults = true;

        while (hasMoreResults) {
          const baseUrl = \`/api/odata/v2/\${config.entityName}\`;
          let queryString = \`$format=json&$inlinecount=allpages&$top=\${top}&$skip=\${skip}\`;

          const navigationPropertiesFromFilter = [];
          const collectNavigationProperties = (filterObj) => {
            if (!filterObj) return;
            if (filterObj.conditions) {
              filterObj.conditions.forEach(collectNavigationProperties);
            } else if (filterObj.field && filterObj.field.includes('/')) {
              const navPath = filterObj.field.substring(0, filterObj.field.lastIndexOf('/'));
              navigationPropertiesFromFilter.push(navPath);
            }
          };

          collectNavigationProperties(config.filter);

          const allProperties = [
            ...(config.selectedProperties?.map(prop => {
              // Handle string format (e.g. "hiringManager/lastName")
              if (typeof prop === 'string') {
                return prop;
              }
              // Handle object format with navigationProperties
              if (prop.navigationProperties?.length > 0) {
                return prop.navigationProperties.map(navProp => 
                  navProp.Name + '/' + (prop.name || prop.Name)
                );
              }
              return prop.name || prop.Name;
            }).flat() || []),
            ...navigationPropertiesFromFilter,
          ];

          if (allProperties.length > 0 && !(allProperties.length === 1 && allProperties[0] === '/')) {
            const filteredProperties = allProperties.filter(prop => {
              if (config.selectedProperties?.some(sp => {
                const propName = sp.name || sp.Name;
                return prop === propName || prop.endsWith('/' + propName);
              })) return true;
              if (!prop.includes('/')) {
                return !allProperties.some(otherProp => 
                  otherProp !== prop && otherProp.startsWith(prop + '/')
                );
              }
              const prefix = prop + '/';
              return !allProperties.some(otherProp => 
                otherProp !== prop && otherProp.startsWith(prefix)
              );
            });

            const selectProperties = filteredProperties.filter(prop => 
              !allProperties.some(otherProp => 
                otherProp !== prop && otherProp.startsWith(prop + '/')
              )
            );

            if (selectProperties.length > 0) {
              queryString += '&$select=' + urlUtils.fixedEncodeURIComponent(selectProperties.join(','));
            }

            const navigationProperties = config.selectedProperties
              ?.map(prop => {
                if (typeof prop === 'string' && prop.includes('/')) {
                  // Get everything up to the last slash
                  return prop.substring(0, prop.lastIndexOf('/'));
                }
                return null;
              })
              .filter(Boolean) || [];

            const expandParam = navigationProperties.join(',');
            if (expandParam) {
              queryString += '&$expand=' + urlUtils.fixedEncodeURIComponent(expandParam);
            }
          }

          const filterString = queryUtils.convertFilterToOData(config.filter);
          if (filterString) {
            queryString += \`&$filter=\${urlUtils.fixedEncodeURIComponent(filterString)}\`;
          }

          await requestManager.waitForOpenSlot();
          try {
            const response = await fetch(\`\${baseUrl}?\${queryString}\`, {
              method: 'GET',
              mode: 'cors',
              headers,
            });

            if (!response.ok) {
              throw new Error(\`Request failed with status \${response.status}\`);
            }

            const data = await response.json();
            allResults.push(...data.d.results);

            const totalCount = parseInt(data.d.__count);
            if (skip + top >= totalCount) {
              hasMoreResults = false;
              break;
            }
            skip += top;
          } finally {
            requestManager.releaseSlot();
          }
        }
        return { d: { results: allResults } };
      });

      const results = await Promise.all(requests);
      return results;
    } catch (error) {
      console.error('Error sending request:', error);
      throw error;
    }
  };
};

// Custom hook for data fetching
const useConfigDataFetching = ({ configEntries, onDataFetched, deps = [] }) => {
  const sendRequest = useSendRequest();

  useEffect(() => {
    const fetchValues = async () => {
      if (!configEntries || Object.keys(configEntries).length === 0) {
        return;
      }

      const configEntriesToFetch = Object.entries(configEntries)
        .map(([value, configEntry]) => {
          if (!configEntry) {
            return null;
          }

          const configArray = Array.isArray(configEntry.configEntries[0])
            ? configEntry.configEntries[0]
            : configEntry.configEntries;
          const [, config] = configArray;
          const entityName = Object.keys(config)[0];
          const entityConfig = config[entityName];

          const selectedProperties = entityConfig.selectedProperties.map(
            (prop) => {
              if (prop.navigationProperties && prop.navigationProperties.length > 0) {
                const navigationPath = prop.navigationProperties
                  .map((nav) => nav.name || nav.Name)
                  .join('/');
                return \`\${navigationPath}/\${prop.name || prop.Name}\`;
              }
              return prop.name || prop.Name;
            },
          );

          return [
            value,
            {
              entityName,
              selectedProperties,
              filter: entityConfig.filter,
            },
          ];
        })
        .filter((entry) => entry !== null);

      if (configEntriesToFetch.length === 0) {
        return;
      }

      try {
        const results = await sendRequest(null, configEntriesToFetch);
        const fetchedValues = {};

        results.forEach((result, index) => {
          const value = Object.keys(configEntries)[index];
          const configEntry = configEntries[value];

          if (result.d.results && result.d.results.length > 0) {
            const selectedProperty = configEntry.selectedProperty;
            const selectedValue = configEntry.selectedValue;

            const getValueByPath = (obj, path) => {
              return path.split('.').reduce((current, key) => {
                if (key === 'results') {
                  return current?.results?.[0];
                }
                return current?.[key];
              }, obj);
            };

            const matchingResult = result.d.results.find((r) => {
              const value = getValueByPath(r, selectedProperty);
              return value === selectedValue.value;
            });

            if (matchingResult) {
              fetchedValues[value] = getValueByPath(matchingResult, selectedProperty) || '';
            }
          }
        });

        onDataFetched(fetchedValues);
      } catch (error) {
        console.error('Error fetching values:', error);
      }
    };

    fetchValues();
  }, [configEntries, sendRequest, onDataFetched, deps]);
};

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

export default function TableComponent({ componentId, columnData, tableColumns, tableConfigEntries }) {
  const [tableData, setTableData] = useState([]);
  const appliedFilters = useSelector((state) => state.uiState.appliedFilters[componentId] || {});
  const sortConfig = useSelector((state) => state.uiState.sortConfigs[componentId]);
  const columns = tableColumns[componentId];
  const data = columnData[componentId];

  // Initialize tableData when columnData changes
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      const rowCount = data[columns[0].label].length;
      const initialData = [];
      for (let i = 0; i < rowCount; i++) {
        const row = {
          id: i,
          ...columns.reduce((acc, column) => {
            acc[column.label] = data[column.label][i];
            return acc;
          }, {})
        };
        initialData.push(row);
      }
      setTableData(initialData);
    }
  }, [data, columns]);

  // Use the config data fetching hook
  useConfigDataFetching({
    configEntries: tableConfigEntries[componentId] || {},
    onDataFetched: (fetchedValues) => {
      setTableData((prevData) => {
        const newData = [...prevData];
        Object.entries(fetchedValues).forEach(([columnId, values]) => {
          const column = columns.find((col) => col.id === columnId);
          if (column) {
            values.forEach((value, rowIndex) => {
              if (rowIndex < newData.length) {
                const configEntry = tableConfigEntries[componentId][columnId];
                const configArray = Array.isArray(configEntry.configEntries[0])
                  ? configEntry.configEntries[0]
                  : configEntry.configEntries;
                const [, config] = configArray;
                const entityName = Object.keys(config)[0];
                const entityConfig = config[entityName];

                if (entityConfig.selectedProperties.length > 1) {
                  const separator = ' ';
                  const combinedValue = entityConfig.selectedProperties
                    .map((prop) => {
                      if (prop.navigationProperties && prop.navigationProperties.length > 0) {
                        let val = value;
                        for (const navProp of prop.navigationProperties) {
                          if (!val) break;
                          const navPropName = navProp.name || navProp.Name;
                          if (val[navPropName]?.results) {
                            val = val[navPropName].results[0];
                          } else {
                            val = val[navPropName];
                          }
                        }
                        const propName = prop.name || prop.Name;
                        return val?.[propName] || '';
                      }
                      const propName = prop.name || prop.Name;
                      return value?.[propName] || '';
                    })
                    .filter(Boolean)
                    .join(separator);
                  newData[rowIndex][column.label] = combinedValue;
                } else {
                  const prop = entityConfig.selectedProperties[0];
                  if (prop.navigationProperties && prop.navigationProperties.length > 0) {
                    let val = value;
                    for (const navProp of prop.navigationProperties) {
                      if (!val) break;
                      const navPropName = navProp.name || navProp.Name;
                      if (val[navPropName]?.results) {
                        val = val[navPropName].results[0];
                      } else {
                        val = val[navPropName];
                      }
                    }
                    const propName = prop.name || prop.Name;
                    newData[rowIndex][column.label] = val?.[propName] || '';
                  } else {
                    const propName = prop.name || prop.Name;
                    newData[rowIndex][column.label] = value?.[propName] || '';
                  }
                }
              }
            });
          }
        });
        return newData;
      });
    },
    deps: [columns],
  });

  const visibleColumns = useSelector((state) => state.uiState.visibleColumns[componentId] || []);

  // Filter columns based on visibleColumns
  const visibleColumnIds = new Set(visibleColumns);
  const filteredColumns = columns.filter(column => visibleColumnIds.has(column.id));

  // If no visible columns are selected, show all columns
  const columnsToUse = filteredColumns.length > 0 ? filteredColumns : columns;

  // Transform columns for DataGrid
  const gridColumns = columnsToUse.map(column => ({
    field: column.label,
    headerName: column.label,
    editable: false,
    flex: 1,
    minWidth: 100,
    resizable: true,
    sortable: true,
    filterable: true,
  }));

  // Apply filters to tableData
  const filteredRows = useMemo(() => {
    return tableData.filter(row => {
      return Object.entries(appliedFilters).every(([columnName, filterValues]) => {
        if (!filterValues || filterValues.length === 0) return true;
        const rowValue = row[columnName];
        
        // Handle cases where both rowValue and filterValues can be arrays
        return filterValues.some(filterValue => {
          // If filterValue is an array, check if any of its values match
          if (Array.isArray(filterValue)) {
            return filterValue.some(val => 
              Array.isArray(rowValue) 
                ? rowValue.includes(val)
                : val === rowValue
            );
          }
          // If filterValue is a single value
          return Array.isArray(rowValue)
            ? rowValue.includes(filterValue)
            : filterValue === rowValue;
        });
      });
    });
  }, [tableData, appliedFilters]);

  // Apply sorting if sortConfig exists
  const sortedRows = useMemo(() => {
    if (!sortConfig) return filteredRows;
    
    return [...filteredRows].sort((a, b) => {
      const aValue = a[sortConfig.column];
      const bValue = b[sortConfig.column];
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredRows, sortConfig]);
  
  return (
    <ThemeProvider theme={theme}>
      <div style={{ height: 500, width: '100%', overflow: 'auto' }}>
        <DataGridPro
          rows={sortedRows}
          columns={gridColumns}
          disableRowSelectionOnClick
          disableColumnReorder={true}
          experimentalFeatures={{ newEditingApi: true }}
          hideFooter
          disableColumnSorting
          disableColumnMenu 
        />
      </div>
    </ThemeProvider>
  );
}`;
};
