import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useReactFlow } from '@xyflow/react';

export default function usePropertyOptions(propertyOptionsId) {
  const propertyOptions = useSelector(
    (state) => state.entities.propertyOptions[propertyOptionsId] || [],
  );
  const config = useSelector((state) => state.entities.config);
  const propertyOptionsState = useSelector(
    (state) => state.entities.propertyOptions,
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

  const sourcePropertyOptions = useMemo(
    () =>
      relatedSourceIds.flatMap(
        (sourceId) => propertyOptionsState[sourceId] || [],
      ),
    [propertyOptionsState, relatedSourceIds],
  );

  const relatedSourceSelectedProperties = relatedSourceIds.flatMap((sourceId) =>
    (config[sourceId] ? Object.values(config[sourceId]) : []).flatMap(
      (entity) =>
        (entity.selectedProperties || []).map(
          (propertyName) =>
            sourcePropertyOptions.find(
              (prop) => prop.Name === propertyName,
            ) || { name: propertyName },
        ),
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
