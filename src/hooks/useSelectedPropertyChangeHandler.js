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
        if (!newSelectedProperties[key].includes(lastPartOfNextKey)) {
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

    console.log('allSelectedPropertyNames', allSelectedPropertyNames);

    if (!newValue || !isTargetOfEdge) {
      dispatch(
        setSelectedProperties({ id, propertyNames: allSelectedPropertyNames }),
      );
    } else {
      dispatch(
        setPropertySelection({
          entityName: selectedEntity,
          propertyNames: allSelectedPropertyNames,
          id,
        }),
      );
    }

    const entity = filteredEntities.find((e) => e.name === selectedEntity);
    const navigationProperties = entity
      ? Array.from(
          new Set(entity.properties.navigationProperties.map((p) => p.Name)),
        ).map((Name) =>
          entity.properties.navigationProperties.find((p) => p.Name === Name),
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
