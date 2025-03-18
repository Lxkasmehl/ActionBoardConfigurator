import { useCallback } from 'react';
import { requestManager } from '../utils/requestManager';
import { convertFilterToOData, generateExpandParam } from '../utils/oDataUtils';
import { fixedEncodeURIComponent } from '../utils/sendRequestUtils';
import { useSelector } from 'react-redux';

const API_USER = import.meta.env.VITE_API_USER;
const API_PASSWORD = import.meta.env.VITE_API_PASSWORD;

export const useSendRequest = (config) => {
  const allEntities = useSelector((state) => state.entities.allEntities);

  const handleSendRequest = useCallback(async () => {
    try {
      const headers = new Headers();
      headers.set(
        'Authorization',
        'Basic ' + btoa(`${API_USER}:${API_PASSWORD}`),
      );
      headers.set('X-SF-Correlation-Id', crypto.randomUUID());
      headers.set('successfactors-sourcetype', 'Application');
      headers.set('Accept', 'application/json');

      const requests = Object.entries(config).flatMap(([, nodeConfig]) => {
        const [entityName, entityConfig] = Object.entries(nodeConfig)[0];

        return async () => {
          const allResults = [];
          let skip = 0;
          const top = 100;
          let hasMoreResults = true;

          while (hasMoreResults) {
            const baseUrl = `/api/odata/v2/${entityName}`;
            let queryString =
              '$format=json&$inlinecount=allpages&$top=' +
              top +
              '&$skip=' +
              skip;

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

            collectNavigationProperties(entityConfig.filter);

            const allProperties = [
              ...(entityConfig.selectedProperties || []),
              ...navigationPropertiesFromFilter,
            ];

            if (allProperties.length > 0) {
              if (!(allProperties.length === 1 && allProperties[0] === '/')) {
                const filteredProperties = allProperties.filter((prop) => {
                  if (
                    entityConfig.selectedProperties &&
                    entityConfig.selectedProperties.includes(prop)
                  ) {
                    return true;
                  }

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

                const navPropertyFields = filteredProperties.map(
                  (prop) => prop,
                );

                const selectProperties = navPropertyFields.filter((prop) => {
                  return !allProperties.some(
                    (otherProp) =>
                      otherProp !== prop && otherProp.startsWith(prop + '/'),
                  );
                });

                if (selectProperties.length > 0) {
                  queryString +=
                    '&$select=' +
                    fixedEncodeURIComponent(selectProperties.join(','));
                }

                const expandParam = generateExpandParam(
                  allProperties,
                  entityName,
                  allEntities,
                );
                if (expandParam) {
                  queryString +=
                    '&$expand=' + fixedEncodeURIComponent(expandParam);
                }
              }
            }

            const filterString = convertFilterToOData(entityConfig.filter);
            if (filterString) {
              queryString +=
                '&$filter=' + fixedEncodeURIComponent(filterString);
            }

            await requestManager.waitForOpenSlot();
            try {
              const response = await fetch(`${baseUrl}?${queryString}`, {
                method: 'GET',
                mode: 'cors',
                headers,
              });

              if (!response.ok) {
                throw new Error(
                  `Request failed with status ${response.status}`,
                );
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
        };
      });

      const results = await Promise.all(requests.map((req) => req()));
      return results;
    } catch (error) {
      console.error('Error sending request:', error);
      throw error;
    }
  }, [config, allEntities]);

  return handleSendRequest;
};
