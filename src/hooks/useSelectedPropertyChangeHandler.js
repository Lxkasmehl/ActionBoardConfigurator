import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setSelectedProperties,
  setPropertySelection,
} from '../redux/entitiesSlice';

export function useSelectedPropertyChangeHandler(
  isTargetOfEdge,
  id,
  setMatchingEntitiesState,
  matchingEntitiesState,
) {
  const dispatch = useDispatch();

  const [selectedPropertiesState, setSelectedPropertiesState] = useState({});

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

    const keys = Object.keys(newSelectedProperties);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const nextKey = keys[i + 1];

      if (nextKey && newSelectedProperties[key]) {
        const lastPartOfNextKey = nextKey.split('/').pop();
        //TODO: darf nicht immer mainAutocomplete sein
        if (
          !newSelectedProperties['mainAutocomplete'].includes(lastPartOfNextKey)
        ) {
          Object.keys(newSelectedProperties).forEach((k) => {
            if (k.includes(key)) {
              delete newSelectedProperties[k];
            }
          });
        }
      }
    }

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
        ? prop.Name.split('/')[0]
        : 'mainAutocomplete';
      if (!propertiesBySection[section]) {
        propertiesBySection[section] = [];
      }
      propertiesBySection[section].push(prop);
    });

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

    const navigationProperties = entity
      ? Array.from(
          new Set([
            ...entity.properties.navigationProperties.map((p) => p.Name),
            ...matchingEntitiesState.flatMap((me) =>
              me.matchingEntity.properties.navigationProperties.map(
                (p) => p.Name,
              ),
            ),
          ]),
        ).map(
          (Name) =>
            entity.properties.navigationProperties.find(
              (p) => p.Name === Name,
            ) ||
            matchingEntitiesState
              .flatMap(
                (me) => me.matchingEntity.properties.navigationProperties,
              )
              .find((p) => p.Name === Name),
        )
      : [];

    let matchingEntities = [];

    allSelectedPropertyNames.forEach((propertyPath) => {
      const propertyName = propertyPath.includes('/')
        ? propertyPath.split('/').slice(-1)[0]
        : propertyPath;

      const matchingProperty = navigationProperties.find((np) => {
        if (np.Name.endsWith('Nav')) {
          return np.Name.slice(0, -3) === propertyName;
        }
        return np.Name === propertyName;
      });

      if (matchingProperty) {
        const matchingAssociationSet = associationSets.find((as) => {
          const relationship = matchingProperty.Relationship.startsWith(
            'SFOData.',
          )
            ? matchingProperty.Relationship.slice(8)
            : matchingProperty.Relationship;
          return as.name === relationship;
        });

        if (matchingAssociationSet) {
          const matchingEndElement = matchingAssociationSet.endElements.find(
            (ee) => {
              return ee.Role === matchingProperty.ToRole;
            },
          );

          if (matchingEndElement) {
            const matchingEntity = allEntities.find((e) => {
              return e.name === matchingEndElement.EntitySet;
            });

            if (matchingEntity) {
              matchingEntities.push({ propertyPath, matchingEntity });
            }
          }
        }
      }
    });

    setMatchingEntitiesState(matchingEntities);
    console.log(config);
  };

  return handleSelectedPropertyChange;
}
