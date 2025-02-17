import { useState, useCallback } from 'react';
import { Modal, ModalDialog, ModalClose, Typography, Button } from '@mui/joy';
import PropTypes from 'prop-types';
import Condition from './Condition';
import ConditionGroup from './ConditionGroup';
import DropdownsAndInput from './DropdownsAndInput';
import { useDispatch } from 'react-redux';
import { setFilter } from '../redux/entitiesSlice';

const buildConditions = (obj) => {
  const conditions = [];
  const grouped = {};

  for (const [key, value] of Object.entries(obj)) {
    const match = key.match(/(property|operator|value)_(\d+)/);
    if (match) {
      const [, type, id] = match;
      if (!grouped[id]) grouped[id] = {};
      grouped[id][type] = value;
    }
  }

  for (const group of Object.values(grouped)) {
    if (group.property && group.operator && group.value) {
      conditions.push({
        field: group.property,
        operator: group.operator,
        value: group.value,
      });
    }
  }

  return conditions;
};

const buildFilterObject = (obj) => {
  const rootLogicId = Math.min(
    ...Object.keys(obj)
      .filter(
        (key) =>
          key.match(/logic_(\d+)/) && parseInt(key.match(/logic_(\d+)/)[1]) > 0,
      )
      .map((key) => parseInt(key.match(/logic_(\d+)/)[1])),
  );
  const rootLogic = rootLogicId
    ? (
        obj[`logic_${rootLogicId}`] || obj[`group_logic_${rootLogicId}`]
      )?.toUpperCase()
    : 'AND';

  const rootConditions = [];
  const logicGroups = {};
  const conditions = buildConditions(obj);

  for (const [key, value] of Object.entries(obj)) {
    const match = key.match(/logic_(\d+)/);
    if (match) {
      const [, id] = match;
      if (!logicGroups[id])
        logicGroups[id] = { logic: value.toUpperCase(), conditions: [] };
    }
  }

  for (const condition of conditions) {
    const groupId = Object.keys(logicGroups).find((id) =>
      Object.keys(obj).some(
        (key) => key.includes(`property_${id}`) && obj[key] === condition.field,
      ),
    );

    if (groupId) {
      if (!logicGroups[groupId].conditions) {
        logicGroups[groupId].conditions = [];
      }
      logicGroups[groupId].conditions.push(condition);
    } else {
      rootConditions.push(condition);
    }
  }

  for (const group of Object.values(logicGroups)) {
    if (group.conditions && group.conditions.length) {
      rootConditions.push({
        logic: group.logic,
        conditions: group.conditions,
      });
    }
  }

  return {
    logic: rootLogic,
    conditions: rootConditions,
  };
};

export default function FilterModal({ open, onClose, entity, id }) {
  const [conditions, setConditions] = useState([]);
  const dispatch = useDispatch();

  const addCondition = useCallback(() => {
    setConditions((prev) => [...prev, { id: Date.now() }]);
  }, []);

  const removeCondition = useCallback((id) => {
    setConditions((prev) => prev.filter((condition) => condition.id !== id));
  }, []);

  const addConditionGroup = useCallback(() => {
    setConditions((prev) => [...prev, { id: Date.now(), conditions: [] }]);
  }, []);

  const removeConditionGroup = useCallback((groupId) => {
    setConditions((prev) => prev.filter((group) => group.id !== groupId));
  }, []);

  const addConditionInsideGroup = useCallback((condition) => {
    setConditions((prev) =>
      prev.map((group) =>
        group.id === condition.id
          ? { ...group, conditions: [...group.conditions, { id: Date.now() }] }
          : group,
      ),
    );
  }, []);

  const removeConditionInsideGroup = useCallback((groupId, subConditionId) => {
    setConditions((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              conditions: group.conditions.filter(
                (c) => c.id !== subConditionId,
              ),
            }
          : group,
      ),
    );
  }, []);

  const saveAndClose = (event) => {
    event.preventDefault();
    const fd = new FormData(event.target);
    const formObject = Object.fromEntries(fd.entries());
    const filterObject = buildFilterObject(formObject);
    dispatch(setFilter({ entityName: entity, id, filterObject }));
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={saveAndClose}>
        <ModalDialog variant='plain'>
          <ModalClose />

          <Typography level='h4'>Build your filter for {entity}</Typography>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-row items-center'>
              <Typography sx={{ mr: 8.3 }}>Where</Typography>
              <DropdownsAndInput
                propertyOptionsId={id}
                fieldIdentifierId={id}
                sx={{ borderTopLeftRadius: 1, borderBottomLeftRadius: 1 }}
              />
            </div>
            {conditions.map((condition) =>
              condition.conditions ? (
                <ConditionGroup
                  key={condition.id}
                  conditionGroup={condition}
                  onAddCondition={addConditionInsideGroup}
                  onRemoveConditionInsideGroup={removeConditionInsideGroup}
                  onRemoveConditionGroup={removeConditionGroup}
                  id={id}
                />
              ) : (
                <Condition
                  key={condition.id}
                  condition={condition}
                  onRemove={removeCondition}
                  id={id}
                />
              ),
            )}
          </div>
          <div className='flex flex-row justify-between'>
            <div className='flex flex-row gap-2 mt-2'>
              <Button variant='plain' color='neutral' onClick={addCondition}>
                + Add condition
              </Button>
              <Button
                variant='plain'
                color='neutral'
                onClick={addConditionGroup}
              >
                + Add condition group
              </Button>
            </div>
            <Button type='submit'>Save</Button>
          </div>
        </ModalDialog>
      </form>
    </Modal>
  );
}

FilterModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  entity: PropTypes.string,
  id: PropTypes.number.isRequired,
};
