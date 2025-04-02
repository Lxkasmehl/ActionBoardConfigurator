import { useDispatch } from 'react-redux';
import { addEntity, removeEntity } from '../../../redux/entitiesSlice';
import {
  setSelectedEntity,
  setMatchingEntitiesForAccordions,
} from '../../../redux/dataPickerSlice';
import {
  setPropertyOptions,
  removeFormData,
} from '../../../redux/dataPickerSlice';

export function useEntityChangeHandler(
  id,
  filteredEntities,
  selectedEntity,
  isTargetOfEdge,
  setMatchingEntitiesState,
  setSelectedPropertiesSectionState,
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

    setSelectedPropertiesSectionState([]);
    setMatchingEntitiesState([]);
    dispatch(setMatchingEntitiesForAccordions({ id, matchingEntities: [] }));
  };

  return handleEntityChange;
}
