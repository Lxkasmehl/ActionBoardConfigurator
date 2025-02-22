import { IconButton } from '@mui/joy';
import DeleteIcon from '@mui/icons-material/Delete';
import DropdownsAndInput from './DropdownsAndInput';
import PropTypes from 'prop-types';
import LogicSelector from './LogicSelector';

export default function Condition({
  condition,
  onRemove,
  id,
  index,
  isSubCondition,
  groupIndex,
}) {
  return (
    <div className='flex flex-row items-center'>
      <LogicSelector
        disabled={index > 1}
        name={
          index === 1
            ? isSubCondition
              ? `subLogic_${groupIndex}`
              : 'logic'
            : ''
        }
        showWhere={index === 0}
        isSubCondition={isSubCondition}
        id={id}
        groupIndex={groupIndex}
      />
      <DropdownsAndInput
        propertyOptionsId={id}
        fieldIdentifierId={condition.id}
      />
      <IconButton
        variant='outlined'
        onClick={() => onRemove(condition.id)}
        sx={{
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        }}
      >
        <DeleteIcon />
      </IconButton>
    </div>
  );
}

Condition.propTypes = {
  condition: PropTypes.object.isRequired,
  id: PropTypes.number.isRequired,
  onRemove: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  isSubCondition: PropTypes.bool.isRequired,
  groupIndex: PropTypes.number,
};
