export const generateUseSendRequest = () => {
  return `
  // API Configuration
const API_USER = import.meta.env.VITE_API_USER;
const API_PASSWORD = import.meta.env.VITE_API_PASSWORD;

// URL Utilities
const urlUtils = {
  fixedEncodeURIComponent: (str) => {
    return encodeURIComponent(str).replace(/[!'()*]/g, (c) => {
      return '%' + c.charCodeAt(0).toString(16);
    });
  },
};

// OData Query Utilities
const queryUtils = {
  convertFilterToOData: (filter) => {
    if (!filter) return '';

    if (filter.operator === 'and' || filter.operator === 'or') {
      const conditions = filter.conditions
        .map((condition) => queryUtils.convertFilterToOData(condition))
        .filter(Boolean);
      return conditions.length > 0
        ? \`(\${conditions.join(\` \${filter.operator} \`)})\`
        : '';
    }

    if (filter.field && filter.operator && filter.value !== undefined) {
      const field = filter.field;
      const value =
        typeof filter.value === 'string' ? \`'\${filter.value}'\` : filter.value;

      switch (filter.operator) {
        case 'eq':
          return \`\${field} eq \${value}\`;
        case 'ne':
          return \`\${field} ne \${value}\`;
        case 'gt':
          return \`\${field} gt \${value}\`;
        case 'ge':
          return \`\${field} ge \${value}\`;
        case 'lt':
          return \`\${field} lt \${value}\`;
        case 'le':
          return \`\${field} le \${value}\`;
        case 'contains':
          return \`contains(\${field},\${value})\`;
        default:
          return '';
      }
    }

    return '';
  },
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

    return new Promise((resolve) => {
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
  },
};

// Custom hook for sending requests
export const useSendRequest = () => {
  return async (_, configEntries) => {
    try {
      const headers = new Headers();
      headers.set(
        'Authorization',
        'Basic ' + btoa(\`\${API_USER}:\${API_PASSWORD}\`),
      );
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
              const navPath = filterObj.field.substring(
                0,
                filterObj.field.lastIndexOf('/'),
              );
              navigationPropertiesFromFilter.push(navPath);
            }
          };

          collectNavigationProperties(config.filter);

          const allProperties = [
            ...(config.selectedProperties
              ?.map((prop) => {
                // Handle string format (e.g. "hiringManager/lastName")
                if (typeof prop === 'string') {
                  return prop;
                }
                // Handle object format with navigationProperties
                if (prop.navigationProperties?.length > 0) {
                  return prop.navigationProperties.map(
                    (navProp) => navProp.Name + '/' + (prop.name || prop.Name),
                  );
                }
                return prop.name || prop.Name;
              })
              .flat() || []),
            ...navigationPropertiesFromFilter,
          ];

          if (
            allProperties.length > 0 &&
            !(allProperties.length === 1 && allProperties[0] === '/')
          ) {
            const filteredProperties = allProperties.filter((prop) => {
              if (
                config.selectedProperties?.some((sp) => {
                  const propName = sp.name || sp.Name;
                  return prop === propName || prop.endsWith('/' + propName);
                })
              )
                return true;
              if (!prop.includes('/')) {
                return !allProperties.some(
                  (otherProp) =>
                    otherProp !== prop && otherProp.startsWith(prop + '/'),
                );
              }
              const prefix = prop + '/';
              return !allProperties.some(
                (otherProp) =>
                  otherProp !== prop && otherProp.startsWith(prefix),
              );
            });

            const selectProperties = filteredProperties.filter(
              (prop) =>
                !allProperties.some(
                  (otherProp) =>
                    otherProp !== prop && otherProp.startsWith(prop + '/'),
                ),
            );

            if (selectProperties.length > 0) {
              queryString +=
                '&$select=' +
                urlUtils.fixedEncodeURIComponent(selectProperties.join(','));
            }

            const navigationProperties =
              config.selectedProperties
                ?.map((prop) => {
                  if (typeof prop === 'string' && prop.includes('/')) {
                    // Get everything up to the last slash
                    return prop.substring(0, prop.lastIndexOf('/'));
                  }
                  return null;
                })
                .filter(Boolean) || [];

            const expandParam = navigationProperties.join(',');
            if (expandParam) {
              queryString +=
                '&$expand=' + urlUtils.fixedEncodeURIComponent(expandParam);
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
  `;
};
