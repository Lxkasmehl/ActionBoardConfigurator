import { useState, useCallback } from 'react';
import { Modal, ModalDialog, ModalClose, Typography, Button } from '@mui/joy';
import PropTypes from 'prop-types';
import Condition from './Condition';
import ConditionGroup from './ConditionGroup';
import { useDispatch } from 'react-redux';
import { setEntityFilter } from '../../../redux/configSlice';
import {
  removeGroupedEntityLogic,
  setFormData,
  setCustomFilter,
  setMatchingEntityObjects,
} from '../../../redux/dataPickerSlice';
import { useReactFlow } from '@xyflow/react';

const buildConditions = (obj) => {
  const conditions = [];
  const groups = new Map();

  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('fullPath_')) {
      const id = key.split('fullPath_')[1];
      const groupMatch = id.match(/^group_(\d+)_(\d+)$/);

      if (groupMatch) {
        const [, groupId, conditionId] = groupMatch;
        if (!groups.has(groupId)) {
          groups.set(groupId, []);
        }
        groups.get(groupId).push({
          id: conditionId,
          field: value,
          operator: obj[`operator_${id}`],
          value: obj[`value_${id}`],
        });
      } else {
        conditions.push({
          id,
          field: value,
          operator: obj[`operator_${id}`],
          value: obj[`value_${id}`],
        });
      }
    }
  }

  return { rootConditions: conditions, groupedConditions: groups };
};

const buildFilterObject = (obj) => {
  const rootLogic = obj['entityLogic']?.toUpperCase() ?? 'AND';
  const { rootConditions, groupedConditions } = buildConditions(obj);
  const conditions = [];

  conditions.push(
    ...rootConditions.map((condition) => ({
      field: condition.field,
      operator: condition.operator,
      value: condition.value,
    })),
  );

  for (const [groupId, groupConditions] of groupedConditions.entries()) {
    if (groupConditions.length > 0) {
      conditions.push({
        entityLogic: obj[`subLogic_${groupId}`]?.toUpperCase() ?? 'AND',
        conditions: groupConditions.map((condition) => ({
          field: condition.field,
          operator: condition.operator,
          value: condition.value,
        })),
      });
    }
  }

  return {
    entityLogic: rootLogic,
    conditions,
  };
};

export default function FilterModal({ open, onClose, entity, id }) {
  const [conditions, setConditions] = useState([]);
  console.log('conditions', conditions);
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

  const removeConditionGroup = useCallback(
    (groupId, index) => {
      setConditions((prev) => prev.filter((group) => group.id !== groupId));
      dispatch(removeGroupedEntityLogic({ id, groupIndex: index }));
    },
    [dispatch, id],
  );

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

  const { getEdges } = useReactFlow();
  const edges = getEdges();
  const isTargetOfEdge = edges.some((edge) => edge.target === id);

  const saveAndClose = (event) => {
    event.preventDefault();

    const fd = new FormData(event.target);
    const formObject = Object.fromEntries(fd.entries());
    const filterObject = buildFilterObject(formObject);

    const matchingEntityObjects = {};
    const elements = event.target.elements;
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (element.name?.startsWith('matchingEntityObject_')) {
        const fieldId = element.name.split('_')[1];
        const value = element.value.trim();
        if (value) {
          try {
            matchingEntityObjects[fieldId] = JSON.parse(value);
          } catch (e) {
            console.warn(
              `Failed to parse matching entity object for field ${fieldId}:`,
              e,
            );
            matchingEntityObjects[fieldId] = null;
          }
        } else {
          matchingEntityObjects[fieldId] = null;
        }
      }
    }

    dispatch(setFormData({ id, formObject }));
    dispatch(setMatchingEntityObjects({ id, matchingEntityObjects }));

    if (isTargetOfEdge) {
      dispatch(setEntityFilter({ entityName: entity, id, filterObject }));
    } else {
      dispatch(setCustomFilter({ id, filterObject }));
    }

    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={saveAndClose}>
        <ModalDialog variant='plain' data-testid='filter-modal'>
          <ModalClose />
          <Typography level='h4'>Build your filter for {entity}</Typography>
          <div className='flex flex-col gap-4'>
            {conditions.map((condition, index) =>
              condition.conditions ? (
                <ConditionGroup
                  key={condition.id}
                  conditionGroup={condition}
                  onAddCondition={addConditionInsideGroup}
                  onRemoveConditionInsideGroup={removeConditionInsideGroup}
                  onRemoveConditionGroup={() =>
                    removeConditionGroup(condition.id, index)
                  }
                  id={id}
                  groupIndex={index}
                />
              ) : (
                <Condition
                  key={condition.id}
                  condition={condition}
                  onRemove={removeCondition}
                  id={id}
                  index={index}
                  isSubCondition={false}
                />
              ),
            )}
          </div>
          <div className='flex flex-row justify-between'>
            <div className='flex flex-row gap-2 mt-2'>
              <Button
                variant='plain'
                color='neutral'
                onClick={addCondition}
                data-testid='add-condition-button'
              >
                + Add condition
              </Button>
              <Button
                variant='plain'
                color='neutral'
                onClick={addConditionGroup}
                data-testid='add-condition-group-button'
              >
                + Add condition group
              </Button>
            </div>
            <Button type='submit' data-testid='filter-modal-save-button'>
              Save
            </Button>
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
