import { useReducer } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  findMatchingEntity,
  getNavigationProperties,
} from '../utils/navigationUtils';
import { setMatchingEntityObjects } from '../redux/entitiesSlice';

const initialState = {
  property: null,
  operator: '',
  value: '',
  matchingEntityObjectState: null,
  path: '',
  autocompleteKey: 0,
  partialPath: '',
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PROPERTY':
      return { ...state, property: action.payload };
    case 'SET_OPERATOR':
      return { ...state, operator: action.payload };
    case 'SET_VALUE':
      return { ...state, value: action.payload };
    case 'SET_MATCHING_ENTITY':
      return { ...state, matchingEntityObjectState: action.payload };
    case 'SET_PATH':
      return { ...state, path: action.payload };
    case 'SET_PARTIAL_PATH':
      return { ...state, partialPath: action.payload };
    case 'INCREMENT_AUTOCOMPLETE_KEY':
      return { ...state, autocompleteKey: state.autocompleteKey + 1 };
    default:
      return state;
  }
}

export default function useDropdownsAndInputState(
  propertyOptionsId,
  fieldIdentifierId,
) {
  const formData = useSelector((state) => state.entities.formData);
  const allEntities = useSelector((state) => state.entities.allEntities);
  const associationSets = useSelector(
    (state) => state.entities.associationSets,
  );
  const filteredEntities = useSelector(
    (state) => state.entities.filteredEntities,
  );
  const matchingEntityObjects = useSelector(
    (state) => state.entities.matchingEntityObjects,
  );
  const selectedEntities = useSelector(
    (state) => state.entities.selectedEntities,
  );
  const selectedEntity = selectedEntities[propertyOptionsId];
  // const { combinedOptions } = usePropertyOptions(propertyOptionsId);
  const propertyOptions = useSelector(
    (state) => state.entities.propertyOptions[propertyOptionsId],
  );
  const dispatch = useDispatch();

  const baseFieldId = fieldIdentifierId.includes('group_')
    ? fieldIdentifierId.split('group_')[1].split('_').slice(1).join('_')
    : fieldIdentifierId;

  const [state, localDispatch] = useReducer(reducer, {
    ...initialState,
    ...getInitialPropertyState(),
    operator:
      formData[propertyOptionsId]?.[`operator_${fieldIdentifierId}`] ?? '',
    value: formData[propertyOptionsId]?.[`value_${fieldIdentifierId}`] ?? '',
    path: formData[propertyOptionsId]?.[`fullPath_${fieldIdentifierId}`] ?? '',
    matchingEntityObjectState:
      matchingEntityObjects[propertyOptionsId]?.[baseFieldId] ??
      matchingEntityObjects[propertyOptionsId]?.[fieldIdentifierId],
    partialPath: (() => {
      const initialPath =
        formData[propertyOptionsId]?.[`fullPath_${fieldIdentifierId}`] ?? '';
      const lastSlashIndex = initialPath.lastIndexOf('/');
      return lastSlashIndex >= 0
        ? initialPath.substring(0, lastSlashIndex)
        : '';
    })(),
  });

  function getInitialPropertyState() {
    const propertyFromForm =
      formData[propertyOptionsId]?.[`property_${fieldIdentifierId}`];

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

    return {
      property: matchingProperty,
    };
  }

  const handleValueChange = (e) => {
    localDispatch({
      type: 'SET_VALUE',
      payload: typeof e === 'object' && e.target ? e.target.value : e,
    });
  };

  const handlePropertyChange = (e, newValue) => {
    if (!newValue) return;

    const newValueName = newValue.Name;
    const currentEntity =
      state.matchingEntityObjectState?.matchingEntity ||
      filteredEntities.find((e) => e.name === selectedEntity);

    const navigationProperties = getNavigationProperties(currentEntity);

    const isNavigationProperty = navigationProperties.some(
      (np) => np.Name === newValueName,
    );

    if (!isNavigationProperty) {
      localDispatch({ type: 'SET_PROPERTY', payload: newValue });
      const pathParts = state.path.split('/');

      let relevantNavigationProperties = navigationProperties;
      if (pathParts.length > 0) {
        let currentEntity = filteredEntities.find(
          (e) => e.name === selectedEntity,
        );

        let newCurrentEntity = currentEntity;
        if (pathParts.length > 1) {
          const result = findMatchingEntity({
            propertyName: pathParts[pathParts.length - 1],
            navigationProperties: currentEntity.properties.navigationProperties,
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

      const newPath = state.matchingEntityObjectState
        ? pathParts.length > 0
          ? lastPartIsNavigation
            ? `${state.path}/${newValueName}`
            : [...pathParts.slice(0, -1), newValueName].join('/')
          : newValueName
        : newValueName;

      localDispatch({ type: 'SET_PATH', payload: newPath });
      localDispatch({
        type: 'SET_MATCHING_ENTITY',
        payload: {
          ...state.matchingEntityObjectState,
          path: newPath,
        },
      });
      localDispatch({ type: 'INCREMENT_AUTOCOMPLETE_KEY' });
      return;
    }

    const newPath = state.matchingEntityObjectState
      ? `${state.partialPath !== '' ? `${state.partialPath}/` : ''}${newValueName}`
      : newValueName;
    localDispatch({ type: 'SET_PATH', payload: newPath });
    localDispatch({ type: 'SET_PARTIAL_PATH', payload: newPath });

    const { matchingEntity } =
      findMatchingEntity({
        propertyName: newValueName,
        navigationProperties,
        associationSets,
        allEntities,
      }) || {};

    const matchingEntityObject = matchingEntity
      ? { path: newPath, matchingEntity }
      : { path: newPath, matchingEntity: {} };

    localDispatch({
      type: 'SET_MATCHING_ENTITY',
      payload: matchingEntityObject,
    });
    localDispatch({ type: 'INCREMENT_AUTOCOMPLETE_KEY' });
    localDispatch({ type: 'SET_PROPERTY', payload: null });

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
  };

  return {
    state,
    handleValueChange,
    handlePropertyChange,
    localDispatch,
  };
}
