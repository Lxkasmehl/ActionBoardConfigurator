import { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getNavigationProperties,
  findMatchingEntity,
} from '../../../shared/utils/entityNavigation';
import { setMatchingEntityObjects } from '../../../redux/dataPickerSlice';

export default function useDropdownsAndInputState(
  propertyOptionsId,
  fieldIdentifierId,
) {
  // Redux selectors
  const formData = useSelector((state) => state.dataPicker.formData);
  const allEntities = useSelector((state) => state.fetchedData.allEntities);
  const associationSets = useSelector(
    (state) => state.fetchedData.associationSets,
  );
  const filteredEntities = useSelector(
    (state) => state.fetchedData.filteredEntities,
  );
  const matchingEntityObjects = useSelector(
    (state) => state.dataPicker.matchingEntityObjects,
  );
  const selectedEntities = useSelector(
    (state) => state.dataPicker.selectedEntities,
  );
  const propertyOptions = useSelector(
    (state) => state.dataPicker.propertyOptions[propertyOptionsId],
  );
  const dispatch = useDispatch();

  // Local state
  const [property, setProperty] = useState(() => {
    const propertyFromForm =
      formData[propertyOptionsId]?.[`property_${fieldIdentifierId}`];
    const baseFieldId = fieldIdentifierId.includes('group_')
      ? fieldIdentifierId.split('group_')[1].split('_').slice(1).join('_')
      : fieldIdentifierId;

    const matchingProperty = matchingEntityObjects[propertyOptionsId]?.[
      baseFieldId
    ]?.matchingEntity
      ? matchingEntityObjects[propertyOptionsId][
          baseFieldId
        ]?.matchingEntity?.properties?.properties?.find(
          (prop) => prop.Name === propertyFromForm,
        )
      : matchingEntityObjects[propertyOptionsId]?.[fieldIdentifierId]
            ?.matchingEntity
        ? matchingEntityObjects[propertyOptionsId][
            fieldIdentifierId
          ]?.matchingEntity?.properties?.properties?.find(
            (prop) => prop.Name === propertyFromForm,
          )
        : propertyFromForm
          ? propertyOptions.find((prop) => prop.Name === propertyFromForm) ||
            null
          : null;

    return matchingProperty;
  });

  const [operator, setOperator] = useState(
    formData[propertyOptionsId]?.[`operator_${fieldIdentifierId}`] ?? '',
  );
  const [value, setValue] = useState(
    formData[propertyOptionsId]?.[`value_${fieldIdentifierId}`] ?? '',
  );
  const [path, setPath] = useState(
    formData[propertyOptionsId]?.[`fullPath_${fieldIdentifierId}`] ?? '',
  );
  const [partialPath, setPartialPath] = useState(() => {
    const initialPath =
      formData[propertyOptionsId]?.[`fullPath_${fieldIdentifierId}`] ?? '';
    const lastSlashIndex = initialPath.lastIndexOf('/');
    return lastSlashIndex >= 0 ? initialPath.substring(0, lastSlashIndex) : '';
  });
  const [matchingEntityState, setMatchingEntityState] = useState(() => {
    const baseFieldId = fieldIdentifierId.includes('group_')
      ? fieldIdentifierId.split('group_')[1].split('_').slice(1).join('_')
      : fieldIdentifierId;
    return (
      matchingEntityObjects[propertyOptionsId]?.[baseFieldId] ??
      matchingEntityObjects[propertyOptionsId]?.[fieldIdentifierId]
    );
  });
  const [autocompleteKey, setAutocompleteKey] = useState(0);

  const handleValueChange = useCallback((e) => {
    setValue(typeof e === 'object' && e.target ? e.target.value : e);
  }, []);

  const handlePropertyChange = useCallback(
    (e, newValue) => {
      if (!newValue) return;

      const newValueName = newValue.Name;
      const selectedEntity = selectedEntities[propertyOptionsId];
      const currentEntity =
        matchingEntityState?.matchingEntity ||
        filteredEntities.find((e) => e.name === selectedEntity);
      const navigationProperties = getNavigationProperties(currentEntity);
      const isNavigationProperty = navigationProperties.some(
        (np) => np.Name === newValueName,
      );

      if (!isNavigationProperty) {
        setProperty(newValue);
        const pathParts = path.split('/');

        let relevantNavigationProperties = navigationProperties;
        if (pathParts.length > 0) {
          let currentEntity = filteredEntities.find(
            (e) => e.name === selectedEntity,
          );

          let newCurrentEntity = currentEntity;
          if (pathParts.length > 1) {
            const result = findMatchingEntity({
              propertyName: pathParts[pathParts.length - 1],
              navigationProperties:
                currentEntity.properties.navigationProperties,
              associationSets,
              allEntities,
            });
            newCurrentEntity = result?.matchingEntity;
          }

          if (newCurrentEntity) {
            relevantNavigationProperties =
              newCurrentEntity.properties.navigationProperties;
          }
        }

        const lastPartIsNavigation = relevantNavigationProperties.some(
          (np) => np.Name === pathParts[pathParts.length - 1],
        );

        const newPath = matchingEntityState
          ? pathParts.length > 0
            ? lastPartIsNavigation
              ? `${path}/${newValueName}`
              : [...pathParts.slice(0, -1), newValueName].join('/')
            : newValueName
          : newValueName;

        setPath(newPath);
        setMatchingEntityState((prev) => ({
          ...prev,
          path: newPath,
        }));
        setAutocompleteKey((prev) => prev + 1);
        return;
      }

      const newPath = `${partialPath !== '' ? `${partialPath}/` : ''}${newValueName}`;
      setPath(newPath);
      setPartialPath(newPath);
      setProperty(null);

      const { matchingEntity } =
        findMatchingEntity({
          propertyName: newValueName,
          navigationProperties,
          associationSets,
          allEntities,
        }) || {};

      const newMatchingEntityState = matchingEntity
        ? { path: newPath, matchingEntity }
        : { path: newPath, matchingEntity: {} };

      setMatchingEntityState(newMatchingEntityState);
      setAutocompleteKey((prev) => prev + 1);

      // Update Redux state
      const updatedMatchingEntityObjects = {
        ...matchingEntityObjects[propertyOptionsId],
        [fieldIdentifierId]: matchingEntity,
      };

      dispatch(
        setMatchingEntityObjects({
          id: propertyOptionsId,
          matchingEntityObjects: updatedMatchingEntityObjects,
        }),
      );
    },
    [
      path,
      partialPath,
      matchingEntityState,
      propertyOptionsId,
      fieldIdentifierId,
      selectedEntities,
      filteredEntities,
      matchingEntityObjects,
      associationSets,
      allEntities,
      dispatch,
    ],
  );

  return {
    state: {
      property,
      operator,
      value,
      path,
      partialPath,
      matchingEntityState,
      autocompleteKey,
    },
    handleValueChange,
    handlePropertyChange,
    setOperator,
  };
}
