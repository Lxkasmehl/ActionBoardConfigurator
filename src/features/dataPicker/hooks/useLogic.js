import { useSelector, useDispatch } from 'react-redux';
import { setEntityLogic, setGroupedEntityLogic } from '../../../redux/entitiesSlice';
import { useCallback } from 'react';

export const useLogic = (id, groupIndex) => {
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.entities.formData);
  const entityLogic = useSelector((state) => state.entities.entityLogic);
  const groupedEntityLogic = useSelector(
    (state) => state.entities.groupedEntityLogic,
  );

  const selectedLogic =
    entityLogic[id] ?? formData[id]?.['entityLogic'] ?? 'and';
  const selectedSubLogic =
    groupedEntityLogic[id]?.[groupIndex] ??
    formData[id]?.[`subLogic_${groupIndex}`] ??
    'and';

  const handleLogicChange = useCallback(
    (_, newValue) => dispatch(setEntityLogic({ id, entityLogic: newValue })),
    [dispatch, id],
  );

  const handleSubLogicChange = useCallback(
    (_, newValue) =>
      dispatch(
        setGroupedEntityLogic({ id, entityLogic: newValue, groupIndex }),
      ),
    [dispatch, id, groupIndex],
  );

  return {
    selectedLogic,
    selectedSubLogic,
    handleLogicChange,
    handleSubLogicChange,
  };
};
