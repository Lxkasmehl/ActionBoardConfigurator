import { useCallback } from 'react';

const API_USER = import.meta.env.VITE_API_USER;
const API_PASSWORD = import.meta.env.VITE_API_PASSWORD;

export const useSendRequest = () => {
  const handleSendRequest = useCallback(async (config) => {
    try {
      const headers = new Headers();
      headers.set(
        'Authorization',
        'Basic ' + btoa(`${API_USER}:${API_PASSWORD}`),
      );
      headers.set('X-SF-Correlation-Id', crypto.randomUUID());
      headers.set('successfactors-sourcetype', 'Application');
      headers.set('Accept', 'application/json');

      const { entity, property, properties, nestedNavigationPath } = config;
      const baseUrl = `/api/odata/v2/${entity}`;

      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.set('$format', 'json');

      // Handle query parameters based on navigation and property selection
      if (nestedNavigationPath?.length > 0) {
        const expandPath = nestedNavigationPath.map((p) => p.name).join('/');
        queryParams.set('$expand', expandPath);

        if (property) {
          queryParams.set('$select', `${expandPath}/${property.name}`);
        }
      } else {
        const selectedProperties = properties || [property];
        if (selectedProperties?.length > 0) {
          queryParams.set(
            '$select',
            selectedProperties
              .filter(Boolean)
              .map((prop) => (typeof prop === 'object' ? prop.name : prop))
              .join(','),
          );
        }
      }

      const response = await fetch(`${baseUrl}?${queryParams.toString()}`, {
        method: 'GET',
        mode: 'cors',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending request:', error);
      throw error;
    }
  }, []);

  return handleSendRequest;
};
