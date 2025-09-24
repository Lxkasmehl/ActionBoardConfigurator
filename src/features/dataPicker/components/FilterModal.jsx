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
  setFilterStorageForNodesNotConnectedToEdges,
  setMatchingEntityObjects,
  setConditionsForFilterModal,
} from '../../../redux/dataPickerSlice';
import { useReactFlow } from '@xyflow/react';
import { useSelector } from 'react-redux';
import { buildFilterObject } from '../utils/filterBuilder';

export default function FilterModal({ open, onClose, entity, id }) {
  const conditionsForFilterModal = useSelector(
    (state) => state.dataPicker.conditionsForFilterModal[id],
  );
  const [conditions, setConditions] = useState(conditionsForFilterModal || []);
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
    dispatch(setConditionsForFilterModal({ id, conditions }));

    if (isTargetOfEdge) {
      dispatch(setEntityFilter({ entityName: entity, id, filterObject }));
    } else {
      dispatch(
        setFilterStorageForNodesNotConnectedToEdges({ id, filterObject }),
      );
    }

    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={saveAndClose}>
        <ModalDialog variant='plain' data-testid='filter-modal'>
          <ModalClose />
          <Typography level='h4'>Build your filter for {entity}</Typography>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
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
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '8px',
                marginTop: '8px',
              }}
            >
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
