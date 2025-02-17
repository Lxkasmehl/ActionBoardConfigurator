import { useState } from 'react';
import { Select, Option, IconButton } from '@mui/joy';
import DeleteIcon from '@mui/icons-material/Delete';
import DropdownsAndInput from './DropdownsAndInput';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

export default function Condition({ condition, onRemove, id }) {
  const rawFormData = useSelector((state) => state.entities.rawFormData);
  const [logic, setLogic] = useState(
    rawFormData[id]?.[`logic_${condition.id}`] ?? 'and',
  );

  return (
    <div className='flex flex-row items-center'>
      <Select
        sx={{ width: 90, mr: 3 }}
        value={logic}
        onChange={(e, newValue) => setLogic(newValue)}
        name={`logic_${condition.id}`}
        required
      >
        <Option value='and'>AND</Option>
        <Option value='or'>OR</Option>
      </Select>
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
};
