import { useSelector, useDispatch } from 'react-redux';
import { setLogic, setSubLogic } from '../redux/entitiesSlice';
import { useCallback } from 'react';

export const useLogic = (id, groupIndex) => {
  const dispatch = useDispatch();
  const rawFormData = useSelector((state) => state.entities.rawFormData);
  const logic = useSelector((state) => state.entities.logic);
  const groupLogic = useSelector((state) => state.entities.groupLogic);

  const selectedLogic = logic[id] ?? rawFormData[id]?.['logic'] ?? 'and';
  const selectedSubLogic =
    groupLogic[id]?.[groupIndex] ??
    rawFormData[id]?.[`subLogic_${groupIndex}`] ??
    'and';

  const handleLogicChange = useCallback(
    (_, newValue) => dispatch(setLogic({ id, logic: newValue })),
    [dispatch, id],
  );

  const handleSubLogicChange = useCallback(
    (_, newValue) => dispatch(setSubLogic({ id, logic: newValue, groupIndex })),
    [dispatch, id, groupIndex],
  );

  return {
    selectedLogic,
    selectedSubLogic,
    handleLogicChange,
    handleSubLogicChange,
  };
};
