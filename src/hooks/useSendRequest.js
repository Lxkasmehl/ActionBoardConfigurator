import { useCallback } from 'react';

const API_USER = import.meta.env.VITE_API_USER;
const API_PASSWORD = import.meta.env.VITE_API_PASSWORD;

export const useSendRequest = (config) => {
  const convertFilterToOData = (filter) => {
    if (!filter || !filter.conditions || filter.conditions.length === 0)
      return '';

    const conditions = filter.conditions.map((condition) => {
      switch (condition.operator) {
        case 'eq':
          return `${condition.field} eq '${condition.value}'`;
        case 'ne':
          return `${condition.field} ne '${condition.value}'`;
        case 'gt':
          return `${condition.field} gt '${condition.value}'`;
        case 'lt':
          return `${condition.field} lt '${condition.value}'`;
        default:
          return `${condition.field} eq '${condition.value}'`;
      }
    });

    return conditions.join(` ${filter.entityLogic || 'AND'} `);
  };

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
          params.append('$select', entityConfig.selectedProperties.join(','));
        }

        const filterString = convertFilterToOData(entityConfig.filter);
        if (filterString) {
          params.append('$filter', filterString);
        }

        return fetch(`${baseUrl}?${params.toString()}`, {
          method: 'GET',
          mode: 'cors',
          headers,
        });
      });

      const responses = await Promise.all(requests);

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
