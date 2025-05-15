export const generateTextComponent = () => {
  return `
    import { Typography } from '@mui/joy';
    import { useEffect, useState, useCallback } from 'react';

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
      },

      generateExpandParam: (properties, entityName, allEntities) => {
        if (!properties || properties.length === 0) return '';
        
        const expandProperties = properties
          .filter(prop => prop.includes('/'))
          .map(prop => prop.split('/')[0])
          .filter((value, index, self) => self.indexOf(value) === index);
        
        return expandProperties.join(',');
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
      return useCallback(async (_, configEntries) => {
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
                ...(config.selectedProperties || []),
                ...navigationPropertiesFromFilter,
              ];

              if (allProperties.length > 0 && !(allProperties.length === 1 && allProperties[0] === '/')) {
                const filteredProperties = allProperties.filter(prop => {
                  if (config.selectedProperties?.includes(prop)) return true;
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
                  queryString += \`&$select=\${urlUtils.fixedEncodeURIComponent(selectProperties.join(','))}\`;
                }

                const expandParam = queryUtils.generateExpandParam(allProperties, config.entityName, {});
                if (expandParam) {
                  queryString += \`&$expand=\${urlUtils.fixedEncodeURIComponent(expandParam)}\`;
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
      }, []);
    };

    export default function TextComponent({component}) {
      const [text, setText] = useState(component.props.text);
      const sendRequest = useSendRequest();

      // Function to extract values from text
      const extractValues = (text) => {
        const regex = /\\[\\[(.*?)\\]\\]/g;
        const matches = [...text.matchAll(regex)];
        return matches.map((match) => match[1]);
      };

      // Function to update text with fetched values
      const updateTextWithFetchedValues = (text, fetchedValues) => {
        let updatedText = text;
        Object.entries(fetchedValues).forEach(([originalValue, newValue]) => {
          updatedText = updatedText.replace(
            \`[[\${originalValue}]]\`,
            \`[[\${newValue}]]\`,
          );
        });
        return updatedText;
      };

      // Effect to fetch values on mount
      useEffect(() => {
        const fetchValues = async () => {
          const values = extractValues(text);
          if (values.length === 0) return;

          const configEntriesToFetch = values
            .filter((value) => component.props.textConfigEntries?.[value])
            // TODO
            .map((value) => {
              const configEntry = component.props.textConfigEntries[value];
              return [
                value,
                {
                  entityName: Object.keys(configEntry.configEntries[0][1])[0],
                  selectedProperties:
                    configEntry.configEntries[0][1][
                      Object.keys(configEntry.configEntries[0][1])[0]
                    ].selectedProperties,
                  filter:
                    configEntry.configEntries[0][1][
                      Object.keys(configEntry.configEntries[0][1])[0]
                    ].filter,
                },
              ];
            });

          if (configEntriesToFetch.length === 0) return;

          try {
            const results = await sendRequest(null, configEntriesToFetch);
            const fetchedValues = {};

            results.forEach((result, index) => {
              const value = values[index];
              const configEntry = component.props.textConfigEntries[value];
              if (result.d.results && result.d.results.length > 0) {
                const selectedProperty = configEntry.selectedProperty;
                const selectedValue = configEntry.selectedValue;

                const matchingResult = result.d.results.find(
                  (r) => r[selectedProperty] === selectedValue.value,
                );

                if (matchingResult) {
                  fetchedValues[value] = matchingResult[selectedProperty];
                }
              }
            });

            const updatedText = updateTextWithFetchedValues(text, fetchedValues);
            if (updatedText !== text) {
              setText(updatedText);
            }
          } catch (error) {
            console.error('Error fetching values:', error);
          }
        };

        fetchValues();
      }, []); // Only run on mount

      return (
        <Typography level={component.props.level} sx={{ marginBottom: '2rem' }}>
          {text}
        </Typography>
      );
    }
  `;
};
