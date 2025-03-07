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

        const baseUrl = `/api/odata/v2/${entityName}`;
        const params = new URLSearchParams();

        params.append('$format', 'json');

        if (entityConfig.selectedProperties?.length > 0) {
          if (
            !(
              entityConfig.selectedProperties.length === 1 &&
              entityConfig.selectedProperties[0] === '/'
            )
          ) {
            params.append('$select', entityConfig.selectedProperties.join(','));
          }
        }

        const filterString = convertFilterToOData(entityConfig.filter);
        if (filterString) {
          params.append('$filter', filterString);
        }

        return async () => {
          await requestManager.waitForOpenSlot();
          try {
            return await fetch(`${baseUrl}?${params.toString()}`, {
              method: 'GET',
              mode: 'cors',
              headers,
            });
          } finally {
            requestManager.releaseSlot();
          }
        };
      });

      const responses = await Promise.all(requests.map((req) => req()));

      for (const response of responses) {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
      }

      const results = await Promise.all(responses.map((r) => r.json()));
      return results;
    } catch (error) {
      console.error('Error sending request:', error);
      throw error;
    }
  }, [config]);

  return handleSendRequest;
};
