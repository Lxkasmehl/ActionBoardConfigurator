import { Select, Option, IconButton } from '@mui/joy';
import DeleteIcon from '@mui/icons-material/Delete';
import DropdownsAndInput from './DropdownsAndInput';
import PropTypes from 'prop-types';

export default function Condition({ condition, onRemove, id }) {
  return (
    <div className='flex flex-row items-center'>
      <Select sx={{ width: 90, mr: 3 }} defaultValue='and'>
        <Option value='and'>AND</Option>
        <Option value='or'>OR</Option>
      </Select>
      <DropdownsAndInput id={id} />
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
};
