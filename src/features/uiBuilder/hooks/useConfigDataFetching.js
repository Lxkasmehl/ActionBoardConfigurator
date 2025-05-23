import { useEffect } from 'react';
import { useSendRequest } from '@/features/dataPicker/hooks/useSendRequest';

export const useConfigDataFetching = ({
  configEntries,
  onDataFetched,
  deps = [],
}) => {
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

          // Handle both possible structures of configEntries
          const configArray = Array.isArray(configEntry.configEntries[0])
            ? configEntry.configEntries[0]
            : configEntry.configEntries;
          const [, config] = configArray;
          const entityName = Object.keys(config)[0];
          const entityConfig = config[entityName];

          // Handle navigation properties and combined properties
          const selectedProperties = entityConfig.selectedProperties.map(
            (prop) => {
              // If the property has navigation properties, include them in the path
              if (
                prop.navigationProperties &&
                prop.navigationProperties.length > 0
              ) {
                const navigationPath = prop.navigationProperties
                  .map((nav) => nav.name || nav.Name)
                  .join('/');
                return `${navigationPath}/${prop.name || prop.Name}`;
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
            // Use the stored selected property and value
            const selectedProperty = configEntry.selectedProperty;
            const selectedValue = configEntry.selectedValue;

            // Helper function to get value from object using dot notation path
            const getValueByPath = (obj, path) => {
              return path.split('.').reduce((current, key) => {
                // If we encounter 'results' in the path, we need to handle it specially
                if (key === 'results') {
                  return current?.results?.[0];
                }
                return current?.[key];
              }, obj);
            };

            // Find the result that matches our selected value
            const matchingResult = result.d.results.find((r) => {
              const value = getValueByPath(r, selectedProperty);
              return value === selectedValue.value;
            });

            if (matchingResult) {
              fetchedValues[value] =
                getValueByPath(matchingResult, selectedProperty) || '';
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
