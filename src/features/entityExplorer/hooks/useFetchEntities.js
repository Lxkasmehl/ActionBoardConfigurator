import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  setFilteredEntities,
  setAllEntities,
  setAssociationSets,
} from '../../../redux/entitiesSlice';
import { RELEVANT_ENTITY_NAMES } from './useFetchEntities.constants';

const API_USER = import.meta.env.VITE_API_USER;
const API_PASSWORD = import.meta.env.VITE_API_PASSWORD;

const useFetchEntities = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const headers = new Headers();
      headers.set(
        'Authorization',
        'Basic ' + btoa(`${API_USER}:${API_PASSWORD}`),
      );
      headers.set('X-SF-Correlation-Id', crypto.randomUUID());
      headers.set('successfactors-sourcetype', 'Application');

      let allFilteredData = [];
      let allData = [];
      let url = '/api/odata/v2/$metadata';

      try {
        while (url) {
          const response = await fetch(url, { mode: 'cors', headers });
          if (!response.ok) throw new Error('Error while fetching data');

          const text = await response.text();
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(text, 'application/xml');

          let associationSetsArray = [];
          const associationSets = Array.from(
            xmlDoc.getElementsByTagName('AssociationSet'),
          );
          associationSets.forEach((associationSet) => {
            const name = associationSet.getAttribute('Name');
            const endElements = Array.from(
              associationSet.getElementsByTagName('End'),
            ).map((end) => {
              const attributes = {};
              Array.from(end.attributes).forEach((attr) => {
                attributes[attr.name] = attr.value;
              });
              return attributes;
            });
            associationSetsArray.push({ name, endElements });
          });
          dispatch(setAssociationSets(associationSetsArray));

          const entitySets = Array.from(
            xmlDoc.getElementsByTagName('EntitySet'),
          );
          const entityTypes = Array.from(
            xmlDoc.getElementsByTagName('EntityType'),
          );

          const entityTypesMap = new Map();
          entityTypes.forEach((entityType) => {
            const name = entityType.getAttribute('Name');
            const properties = Array.from(
              entityType.getElementsByTagName('Property'),
            ).map((property) => {
              const attributes = {};
              Array.from(property.attributes).forEach((attr) => {
                attributes[attr.name] = attr.value;
              });
              return attributes;
            });
            const navigationProperties = Array.from(
              entityType.getElementsByTagName('NavigationProperty'),
            ).map((navProp) => {
              const attributes = {};
              Array.from(navProp.attributes).forEach((attr) => {
                attributes[attr.name] = attr.value;
              });
              return attributes;
            });
            entityTypesMap.set(name, { properties, navigationProperties });
          });

          const metadata = entitySets.map((entity) => {
            const name = entity.getAttribute('Name');
            const attributes = {};
            Array.from(entity.attributes).forEach((attr) => {
              attributes[attr.name.toLowerCase()] = attr.value;
            });

            if (entityTypesMap.has(name)) {
              attributes.properties = entityTypesMap.get(name);
            }

            return attributes;
          });

          const filteredMetadata = metadata.filter((entity) => {
            const name = entity.name || '';
            return (
              RELEVANT_ENTITY_NAMES.has(name) ||
              /^Goal_\d+$/.test(name) ||
              /^DevGoal_\d+$/.test(name)
            );
          });

          allData = [...allData, ...metadata];
          allFilteredData = [...allFilteredData, ...filteredMetadata];

          const nextLink = response.headers.get('OData-NextLink');
          url = nextLink ? nextLink : null;
        }

        dispatch(setFilteredEntities(allFilteredData));
        dispatch(setAllEntities(allData));
      } catch (error) {
        console.error('API Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  return loading;
};

export default useFetchEntities;
