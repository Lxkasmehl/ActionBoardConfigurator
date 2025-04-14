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

      const { entity, property, properties } = config;
      const baseUrl = `/api/odata/v2/${entity}`;
      const selectedProperties = properties || [property];
      const queryString = `$format=json&$select=${encodeURIComponent(selectedProperties.join(','))}`;

      const response = await fetch(`${baseUrl}?${queryString}`, {
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
