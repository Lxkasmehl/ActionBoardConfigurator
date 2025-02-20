import { Button, Card, Typography, Select, Option, IconButton } from '@mui/joy';
import DeleteIcon from '@mui/icons-material/Delete';
import Condition from './Condition';
import PropTypes from 'prop-types';
import { useLogic } from '../hooks/useLogic';

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
      {groupIndex === 0 ? (
        <Typography sx={{ mr: 8.3 }}>Where</Typography>
      ) : (
        <Select
          sx={{ width: 90, mr: 3, height: 'fit-content' }}
          value={selectedLogic}
          onChange={handleLogicChange}
          name={groupIndex === 1 ? 'logic' : ''}
          required
          disabled={groupIndex > 1}
        >
          <Option value='and'>AND</Option>
          <Option value='or'>OR</Option>
        </Select>
      )}
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
