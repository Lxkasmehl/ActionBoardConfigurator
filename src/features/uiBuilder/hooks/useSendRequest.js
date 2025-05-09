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

      // Handle navigation properties
      if (nestedNavigationPath && nestedNavigationPath.length > 0) {
        // Build the expand path for nested navigation properties
        const expandPath = nestedNavigationPath.map((p) => p.name).join('/');
        queryParams.set('$expand', expandPath);

        // If we have a final property selected, add it to the select
        if (property) {
          // Only add the property name to the select path, not the full navigation path again
          queryParams.set('$select', `${expandPath}/${property.name}`);
        }
      } else if (properties && properties.length > 1) {
        // Handle simple navigation property case
        const [navProperty, nestedProperty] = properties;
        queryParams.set('$expand', navProperty);
        queryParams.set('$select', `${navProperty}/${nestedProperty}`);
      } else {
        // For regular properties, just use select
        const selectedProperties = properties || [property];
        queryParams.set(
          '$select',
          selectedProperties.map((prop) => prop.name).join(','),
        );
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
