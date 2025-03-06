import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setSelectedProperties,
  setPropertySelection,
  setPropertiesBySection,
} from '../redux/entitiesSlice';
import {
  findMatchingEntity,
  getNavigationProperties,
} from '../utils/navigationUtils';

export function useSelectedPropertyChangeHandler(
  isTargetOfEdge,
  id,
  setMatchingEntitiesState,
  matchingEntitiesState,
  setAccordionSelectedProperties,
  accordionSelectedProperties,
) {
  const dispatch = useDispatch();

  const [selectedPropertiesState, setSelectedPropertiesState] = useState({});
  const [previousKeys, setPreviousKeys] = useState([]);

  const allEntities = useSelector((state) => state.entities.allEntities);
  const associationSets = useSelector(
    (state) => state.entities.associationSets,
  );
  const filteredEntities = useSelector(
    (state) => state.entities.filteredEntities,
  );
  const config = useSelector((state) => state.entities.config);
  const selectedEntities = useSelector(
    (state) => state.entities.selectedEntities,
  );
  const selectedEntity = selectedEntities[id];

  const handleSelectedPropertyChange = (autocompleteId, _, newValue) => {
    const newSelectedProperties = {
      ...selectedPropertiesState,
      [autocompleteId]: newValue.map((item) => item.Name),
    };
    setSelectedPropertiesState(newSelectedProperties);

    const currentKeys = Object.entries(newSelectedProperties)
      .filter(([, values]) => values.length > 0)
      .map(([key]) => key);

    const removedValues = previousKeys.reduce((acc, key) => {
      const previousValues = selectedPropertiesState[key] || [];
      const currentValues = newSelectedProperties[key] || [];
      const removed = previousValues.filter(
        (value) => !currentValues.includes(value),
      );

      if (removed.length > 0) {
        acc[key] = removed;
      }
      return acc;
    }, {});

    if (Object.keys(removedValues).length > 0) {
      Object.entries(removedValues).forEach(([key, values]) => {
        console.log(`Removed ${key}/${values}`);

        Object.keys(newSelectedProperties).forEach((k) => {
          if (key === 'mainAutocomplete') {
            if (k.startsWith(values)) {
              delete newSelectedProperties[k];
              setAccordionSelectedProperties(
                (Array.isArray(accordionSelectedProperties)
                  ? accordionSelectedProperties
                  : []
                ).filter((prop) => prop.Name !== k),
              );
            }
          } else if (k.includes(`${key}/${values}`)) {
            delete newSelectedProperties[k];
            setAccordionSelectedProperties(
              (Array.isArray(accordionSelectedProperties)
                ? accordionSelectedProperties
                : []
              ).filter((prop) => prop.Name !== k),
            );
          }
        });
      });
    }

    setPreviousKeys(currentKeys);

    const allSelectedPropertyNames = Object.entries(
      newSelectedProperties,
    ).flatMap(([key, values]) => {
      if (key === 'mainAutocomplete') {
        return values;
      }
      return values.map((value) => `${key}/${value}`);
    });

    const entity = filteredEntities.find((e) => e.name === selectedEntity);

    const availableProperties = [
      ...entity.properties.properties,
      ...entity.properties.navigationProperties,
      ...matchingEntitiesState.flatMap((me) => [
        ...me.matchingEntity.properties.properties.map((prop) => ({
          ...prop,
          Name: `${me.propertyPath}/${prop.Name}`,
          ['sap:label']: `${me.propertyPath}/${prop['sap:label']}`,
        })),
        ...me.matchingEntity.properties.navigationProperties.map((prop) => ({
          ...prop,
          Name: `${me.propertyPath}/${prop.Name}`,
          ['sap:label']: `${me.propertyPath}/${prop['sap:label']}`,
        })),
      ]),
    ];

    const uniqueAvailableProperties = availableProperties.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t['sap:label'] === value['sap:label']),
    );

    const propertiesBySection = {};
    uniqueAvailableProperties.forEach((prop) => {
      const section = prop.Name.includes('/')
        ? prop.Name.split('/').slice(0, -1).join('/')
        : 'mainAutocomplete';
      if (!propertiesBySection[section]) {
        propertiesBySection[section] = [];
      }
      propertiesBySection[section].push(prop);
    });

    dispatch(setPropertiesBySection({ id, propertiesBySection }));

    const sectionSelectionStatus = Object.entries(propertiesBySection).map(
      ([section, props]) => {
        const selectedPropsInSection = allSelectedPropertyNames.filter(
          (selected) => {
            if (section === 'mainAutocomplete') {
              return !selected.includes('/');
            }
            return selected.startsWith(`${section}/`);
          },
        );

        const allPropsInSectionSelected = props.every((prop) =>
          selectedPropsInSection.some(
            (selected) =>
              selected === prop.Name || selected.endsWith(`/${prop.Name}`),
          ),
        );

        return { section, allPropsSelected: allPropsInSectionSelected };
      },
    );

    let propertyNames = [];
    propertyNames = Object.entries(newSelectedProperties).flatMap(
      ([key, values]) => {
        const sectionStatus = sectionSelectionStatus.find(
          (s) => s.section === key,
        );
        if (sectionStatus?.allPropsSelected) {
          return key === 'mainAutocomplete' ? ['/'] : [`${key}/`];
        }
        if (key === 'mainAutocomplete') {
          return values;
        }
        return values.map((value) => `${key}/${value}`);
      },
    );

    if (!newValue || !isTargetOfEdge) {
      dispatch(
        setSelectedProperties({
          id,
          propertyNames,
        }),
      );
    } else {
      dispatch(
        setPropertySelection({
          entityName: selectedEntity,
          propertyNames,
          id,
        }),
      );
    }

    const navigationProperties = getNavigationProperties(entity);

    let matchingEntities = [];
    allSelectedPropertyNames.forEach((propertyPath) => {
      const propertyName = propertyPath.includes('/')
        ? propertyPath.split('/').slice(-1)[0]
        : propertyPath;

      const { matchingEntity } =
        findMatchingEntity({
          propertyName,
          navigationProperties,
          associationSets,
          allEntities,
        }) || {};

      if (matchingEntity) {
        matchingEntities.push({ propertyPath, matchingEntity });
      }
    });

    console.log('matchingEntities', matchingEntities);

    setMatchingEntitiesState(matchingEntities);
    console.log(config);
  };

  return handleSelectedPropertyChange;
}
