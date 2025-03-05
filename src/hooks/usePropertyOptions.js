import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useReactFlow } from '@xyflow/react';

export default function usePropertyOptions(propertyOptionsId) {
  const propertyOptions = useSelector(
    (state) => state.entities.propertyOptions[propertyOptionsId] || [],
  );
  const config = useSelector((state) => state.entities.config);
  const propertiesBySection = useSelector(
    (state) => state.entities.propertiesBySection || {},
  );

  const { getEdges } = useReactFlow();
  const edges = getEdges();

  const sortedPropertyOptions = useMemo(
    () => [...propertyOptions].sort((a, b) => a.Name.localeCompare(b.Name)),
    [propertyOptions],
  );

  const relatedSourceIds = edges
    .filter((edge) => edge.target === propertyOptionsId)
    .map((edge) => edge.source);

  const relatedSourceSelectedProperties = relatedSourceIds.flatMap((sourceId) =>
    (config[sourceId] ? Object.values(config[sourceId]) : []).flatMap(
      (entity) =>
        (entity.selectedProperties || []).map((propertyPath) => {
          if (!propertyPath.includes('/')) {
            return propertiesBySection[sourceId]['mainAutocomplete'].find(
              (prop) => prop.Name === propertyPath,
            );
          } else {
            const path = propertyPath.split('/').slice(0, -1).join('/');
            return propertiesBySection[sourceId][path].find(
              (prop) => prop.Name === propertyPath,
            );
          }
        }),
    ),
  );

  const relatedSourceEntities = relatedSourceIds.flatMap((sourceId) =>
    config[sourceId] ? Object.keys(config[sourceId]) : [],
  );

  const groupedAvailableProperties = useMemo(() => {
    return sortedPropertyOptions.reduce((acc, prop) => {
      const label = prop.Name;
      const firstLetter = label[0].toUpperCase();
      if (!acc[firstLetter]) acc[firstLetter] = [];
      acc[firstLetter].push(prop);
      return acc;
    }, {});
  }, [sortedPropertyOptions]);

  const combinedOptions = useMemo(() => {
    const entityGroups = relatedSourceEntities.map((entity) => {
      const relevantProperties = relatedSourceSelectedProperties.filter(
        (prop) =>
          relatedSourceIds.some(
            (sourceId) =>
              config[sourceId] &&
              Object.keys(config[sourceId]).some(
                (entityConfig) =>
                  entityConfig === entity &&
                  config[sourceId][entityConfig]?.selectedProperties?.includes(
                    prop.Name,
                  ),
              ),
          ),
      );

      return {
        group: `Selected Props of ${entity}`,
        options: relevantProperties,
      };
    });

    const letterGroups = Object.keys(groupedAvailableProperties)
      .sort()
      .map((letter) => ({
        group: letter,
        options: groupedAvailableProperties[letter],
      }));

    return [...entityGroups, ...letterGroups];
  }, [
    relatedSourceEntities,
    relatedSourceSelectedProperties,
    relatedSourceIds,
    config,
    groupedAvailableProperties,
  ]);

  return {
    combinedOptions,
    propertyOptions,
  };
}
