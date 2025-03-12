import { Button, Card, Typography, IconButton } from '@mui/joy';
import DeleteIcon from '@mui/icons-material/Delete';
import Condition from './Condition';
import PropTypes from 'prop-types';
import { useLogic } from '../hooks/useLogic';
import LogicSelector from './LogicSelector';

export default function ConditionGroup({
  conditionGroup,
  onAddCondition,
  onRemoveConditionInsideGroup,
  onRemoveConditionGroup,
  id,
  groupIndex,
}) {
  const { selectedLogic, handleLogicChange } = useLogic(id, groupIndex);

  return (
    <div key={conditionGroup.id} className='flex flex-row'>
      <LogicSelector
        value={selectedLogic}
        onChange={handleLogicChange}
        disabled={groupIndex > 1}
        name={groupIndex === 1 ? 'entityLogic' : ''}
        showWhere={groupIndex === 0}
      />

      <Card>
        <div className='flex flex-row items-center justify-between'>
          <Typography>Any of the following are true...</Typography>
          <IconButton
            variant='plain'
            onClick={() => onRemoveConditionGroup(conditionGroup.id)}
          >
            <DeleteIcon />
          </IconButton>
        </div>
        {conditionGroup.conditions.map((subCondition, index) => (
          <Condition
            key={subCondition.id}
            condition={subCondition}
            onRemove={() =>
              onRemoveConditionInsideGroup(conditionGroup.id, subCondition.id)
            }
            id={id}
            index={index}
            isSubCondition
            groupIndex={groupIndex}
            groupId={conditionGroup.id}
          />
        ))}

        <Button
          variant='plain'
          color='neutral'
          onClick={() => onAddCondition(conditionGroup)}
          sx={{
            width: 'fit-content',
          }}
        >
          + Add condition
        </Button>
      </Card>
    </div>
  );
}

ConditionGroup.propTypes = {
  conditionGroup: PropTypes.shape({
    id: PropTypes.number.isRequired,
    conditions: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
      }),
    ).isRequired,
  }).isRequired,
  onRemoveConditionInsideGroup: PropTypes.func.isRequired,
  onAddCondition: PropTypes.func.isRequired,
  onRemoveConditionGroup: PropTypes.func.isRequired,
  id: PropTypes.number.isRequired,
  groupIndex: PropTypes.number.isRequired,
};
