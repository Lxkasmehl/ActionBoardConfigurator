import { useCallback } from 'react';
import { requestManager } from '../utils/requestManager';
import { convertFilterToOData } from '../utils/oDataUtils';

const API_USER = import.meta.env.VITE_API_USER;
const API_PASSWORD = import.meta.env.VITE_API_PASSWORD;

export const useSendRequest = (config) => {
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
            const params = new URLSearchParams();

            params.append('$format', 'json');
            params.append('$inlinecount', 'allpages');
            params.append('$top', top.toString());
            params.append('$skip', skip.toString());

            if (entityConfig.selectedProperties?.length > 0) {
              if (
                !(
                  entityConfig.selectedProperties.length === 1 &&
                  entityConfig.selectedProperties[0] === '/'
                )
              ) {
                params.append(
                  '$select',
                  entityConfig.selectedProperties.join(','),
                );
              }
            }

            const filterString = convertFilterToOData(entityConfig.filter);
            if (filterString) {
              params.append('$filter', filterString);
            }

            await requestManager.waitForOpenSlot();
            try {
              const response = await fetch(`${baseUrl}?${params.toString()}`, {
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
  }, [config]);

  return handleSendRequest;
};
