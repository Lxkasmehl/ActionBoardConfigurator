import { Select, Option, IconButton, Typography } from '@mui/joy';
import DeleteIcon from '@mui/icons-material/Delete';
import DropdownsAndInput from './DropdownsAndInput';
import PropTypes from 'prop-types';
import { useLogic } from '../hooks/useLogic';

export default function Condition({
  condition,
  onRemove,
  id,
  index,
  isSubCondition,
  groupIndex,
}) {
  const {
    selectedLogic,
    selectedSubLogic,
    handleLogicChange,
    handleSubLogicChange,
  } = useLogic(id, groupIndex);

  return (
    <div className='flex flex-row items-center'>
      {index === 0 ? (
        <Typography sx={{ mr: 8.3 }}>Where</Typography>
      ) : (
        <Select
          sx={{ width: 90, mr: 3 }}
          value={isSubCondition ? selectedSubLogic : selectedLogic}
          onChange={isSubCondition ? handleSubLogicChange : handleLogicChange}
          required
          disabled={index > 1}
          name={
            index === 1
              ? isSubCondition
                ? `subLogic_${groupIndex}`
                : 'logic'
              : ''
          }
        >
          <Option value='and'>AND</Option>
          <Option value='or'>OR</Option>
        </Select>
      )}
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
