import { useDispatch } from 'react-redux';
import {
  addEntity,
  removeEntity,
  removeFormData,
  setPropertyOptions,
  setSelectedEntity,
} from '../redux/entitiesSlice';

export function useEntityChangeHandler(
  id,
  filteredEntities,
  selectedEntity,
  isTargetOfEdge,
  setResetKey,
  setMatchingEntitiesState,
) {
  const dispatch = useDispatch();

  const handleEntityChange = (_, newValue) => {
    if (!newValue) return;

    const entityName = newValue.name;
    const entity = filteredEntities.find((e) => e.name === entityName);
    const properties = entity ? entity.properties.properties : [];
    const navigationProperties = entity
      ? entity.properties.navigationProperties
      : [];
    const combinedProperties = [...properties, ...navigationProperties];

    if (isTargetOfEdge) {
      if (selectedEntity) {
        dispatch(removeEntity({ id, entityName: selectedEntity }));
      }
      dispatch(addEntity({ id, entityName }));
      dispatch(removeFormData({ id }));
    }

    dispatch(setPropertyOptions({ id, properties: combinedProperties }));
    dispatch(setSelectedEntity({ id, entityName }));

    setResetKey((prevKey) => prevKey + 1);
    setMatchingEntitiesState([]);
  };

  return handleEntityChange;
}
