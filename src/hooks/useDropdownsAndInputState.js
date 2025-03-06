import { useReducer } from 'react';
import { useSelector } from 'react-redux';
import usePropertyOptions from './usePropertyOptions';
import {
  findMatchingEntity,
  getNavigationProperties,
} from '../utils/navigationUtils';

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
  const storedMatchingEntityObjects = useSelector(
    (state) => state.entities.matchingEntityObjects,
  );
  const allEntities = useSelector((state) => state.entities.allEntities);
  const associationSets = useSelector(
    (state) => state.entities.associationSets,
  );
  const filteredEntities = useSelector(
    (state) => state.entities.filteredEntities,
  );
  const selectedEntities = useSelector(
    (state) => state.entities.selectedEntities,
  );
  const selectedEntity = selectedEntities[propertyOptionsId];
  const { combinedOptions, propertyOptions } =
    usePropertyOptions(propertyOptionsId);

  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    property: formData[propertyOptionsId]?.[`property_${fieldIdentifierId}`]
      ? propertyOptions.find(
          (prop) =>
            prop.Name ===
            formData[propertyOptionsId]?.[`property_${fieldIdentifierId}`],
        ) || null
      : null,
    operator:
      formData[propertyOptionsId]?.[`operator_${fieldIdentifierId}`] ?? '',
    value: formData[propertyOptionsId]?.[`value_${fieldIdentifierId}`] ?? '',
    matchingEntityObjectState:
      storedMatchingEntityObjects[propertyOptionsId]?.[fieldIdentifierId] ||
      null,
    path: formData[propertyOptionsId]?.[`fullPath_${fieldIdentifierId}`] ?? '',
    partialPath: (() => {
      const initialPath =
        formData[propertyOptionsId]?.[`fullPath_${fieldIdentifierId}`] ?? '';
      const lastSlashIndex = initialPath.lastIndexOf('/');
      return lastSlashIndex >= 0
        ? initialPath.substring(0, lastSlashIndex)
        : '';
    })(),
  });

  const handleValueChange = (e) => {
    dispatch({
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

    const isNavigationProperty = navigationProperties.some((np) =>
      np.Name.endsWith('Nav')
        ? np.Name.slice(0, -3) === newValueName
        : np.Name === newValueName,
    );

    if (!isNavigationProperty) {
      dispatch({ type: 'SET_PROPERTY', payload: newValue });
      const pathParts = state.path.split('/');

      let relevantNavigationProperties = navigationProperties;
      if (pathParts.length > 0) {
        const currentEntity = filteredEntities.find(
          (e) => e.name === selectedEntity,
        );
        const { matchingEntity: newCurrentEntity } =
          findMatchingEntity({
            propertyName: pathParts[pathParts.length - 1],
            navigationProperties: currentEntity.properties.navigationProperties,
            associationSets,
            allEntities,
          }) || {};

        if (newCurrentEntity) {
          relevantNavigationProperties =
            newCurrentEntity.properties.navigationProperties;
        }
      }

      const lastPartIsNavigation = relevantNavigationProperties.some((np) =>
        np.Name.endsWith('Nav')
          ? np.Name.slice(0, -3) === pathParts[pathParts.length - 1]
          : np.Name === pathParts[pathParts.length - 1],
      );

      const newPath = state.matchingEntityObjectState
        ? pathParts.length > 0
          ? lastPartIsNavigation
            ? `${state.path}/${newValueName}`
            : [...pathParts.slice(0, -1), newValueName].join('/')
          : newValueName
        : newValueName;

      dispatch({ type: 'SET_PATH', payload: newPath });
      dispatch({
        type: 'SET_MATCHING_ENTITY',
        payload: {
          ...state.matchingEntityObjectState,
          path: newPath,
        },
      });
      dispatch({ type: 'INCREMENT_AUTOCOMPLETE_KEY' });
      return;
    }

    const newPath = state.matchingEntityObjectState
      ? `${state.partialPath !== '' ? `${state.partialPath}/` : ''}${newValueName}`
      : newValueName;
    dispatch({ type: 'SET_PATH', payload: newPath });
    dispatch({ type: 'SET_PARTIAL_PATH', payload: newPath });

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

    dispatch({ type: 'SET_MATCHING_ENTITY', payload: matchingEntityObject });
    dispatch({ type: 'INCREMENT_AUTOCOMPLETE_KEY' });
  };

  return {
    state,
    handleValueChange,
    handlePropertyChange,
    combinedOptions,
    dispatch,
  };
}
