import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useReactFlow } from '@xyflow/react';
import { useSendRequest } from './useSendRequest';
import { typeUtils } from '../../../shared/utils/entityOperations';

export default function useRelatedSourceData(propertyOptionsId, propertyType) {
  const [relatedSourceData, setRelatedSourceData] = useState([]);

  const config = useSelector((state) => state.entities.config);
  const propertiesBySection = useSelector(
    (state) => state.entities.propertiesBySection || {},
  );
  const { getEdges } = useReactFlow();

  const relatedSourceInfo = useMemo(() => {
    if (!propertyOptionsId) return { relatedSourceIds: [], tempConfig: {} };

    const edges = getEdges();
    const relatedSourceIds = edges
      .filter((edge) => edge.target === propertyOptionsId)
      .map((edge) => edge.source);

    if (relatedSourceIds.length === 0)
      return { relatedSourceIds: [], tempConfig: {} };

    const tempConfig = {};
    relatedSourceIds.forEach((sourceId) => {
      if (config[sourceId]) {
        tempConfig[sourceId] = config[sourceId];
      }
    });

    return { relatedSourceIds, tempConfig };
  }, [propertyOptionsId, getEdges, config]);

  const sendRequest = useSendRequest(relatedSourceInfo.tempConfig);

  const fetchRelatedSourceData = useCallback(async () => {
    if (
      !propertyOptionsId ||
      Object.keys(relatedSourceInfo.tempConfig).length === 0
    )
      return;

    try {
      const results = await sendRequest();
      const flattenedData = results.flatMap((result, index) => {
        const sourceId = relatedSourceInfo.relatedSourceIds[index];
        const entityData = result.d.results;
        return entityData.map((item) => ({
          sourceId,
          ...item,
        }));
      });

      setRelatedSourceData(flattenedData);
    } catch (error) {
      console.error('Error fetching related source data:', error);
    }
  }, [propertyOptionsId, relatedSourceInfo, sendRequest]);

  useEffect(() => {
    fetchRelatedSourceData();
  }, [fetchRelatedSourceData]);

  const relatedSourceProperties = useMemo(() => {
    if (!propertyOptionsId) return [];

    return relatedSourceInfo.relatedSourceIds
      .flatMap((sourceId) =>
        (config[sourceId] ? Object.values(config[sourceId]) : []).flatMap(
          (entity) =>
            (entity.selectedProperties || []).map((propertyPath) => {
              if (!propertyPath.includes('/')) {
                return propertiesBySection[sourceId]['mainAutocomplete']?.find(
                  (prop) => prop.Name === propertyPath,
                );
              } else {
                const path = propertyPath.split('/').slice(0, -1).join('/');
                return propertiesBySection[sourceId][path]?.find(
                  (prop) => prop.Name === propertyPath,
                );
              }
            }),
        ),
      )
      .filter(Boolean);
  }, [
    propertyOptionsId,
    relatedSourceInfo.relatedSourceIds,
    config,
    propertiesBySection,
  ]);

  const processedValues = useMemo(() => {
    const propertyValuesByType = {};

    relatedSourceProperties.forEach((prop) => {
      if (!prop) return;

      const propertyName = prop.Name;
      const propType = prop.Type || prop.type;
      const baseType = typeUtils.getBaseType(propType);

      if (!propertyValuesByType[baseType]) {
        propertyValuesByType[baseType] = [];
      }

      const values = relatedSourceData
        .filter((item) => {
          if (propertyName.includes('/')) {
            const parts = propertyName.split('/');
            let current = item;
            for (const part of parts) {
              if (!current || current[part] === undefined) return false;
              current = current[part];
            }
            return current !== undefined;
          }
          return item[propertyName] !== undefined;
        })
        .map((item) => {
          if (propertyName.includes('/')) {
            const parts = propertyName.split('/');
            let value = item;
            for (const part of parts) {
              value = value[part];
            }
            return { value, propertyName, propType };
          }
          return { value: item[propertyName], propertyName, propType };
        })
        .filter((item) => item.value !== null && item.value !== undefined);

      propertyValuesByType[baseType].push(...values);
    });

    const currentBaseType = typeUtils.getBaseType(propertyType);
    const filteredValues =
      propertyValuesByType[currentBaseType]?.filter((item) =>
        typeUtils.valueMatchesType(item.value, propertyType),
      ) || [];

    // Remove duplicates and sort
    const uniqueValues = [];
    const seen = new Set();

    filteredValues.forEach((item) => {
      const valueStr = String(item.value);
      if (!seen.has(valueStr)) {
        seen.add(valueStr);
        uniqueValues.push(item);
      }
    });

    if (uniqueValues.length > 0) {
      uniqueValues.sort((a, b) => {
        if (currentBaseType === 'date') {
          const aValue = String(a.value);
          const bValue = String(b.value);

          if (aValue.startsWith('/Date(') && bValue.startsWith('/Date(')) {
            const aTimestamp = parseInt(
              aValue.substring(6, aValue.length - 2).split('+')[0],
              10,
            );
            const bTimestamp = parseInt(
              bValue.substring(6, bValue.length - 2).split('+')[0],
              10,
            );
            return aTimestamp - bTimestamp;
          }
        }

        if (currentBaseType === 'number') {
          return parseFloat(a.value) - parseFloat(b.value);
        }

        return String(a.value).localeCompare(String(b.value));
      });
    }

    return uniqueValues;
  }, [relatedSourceProperties, relatedSourceData, propertyType]);

  return {
    processedValues,
    isLoading: false, // Add loading state if needed
  };
}
