import { useState } from 'react';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Button,
  Select,
  Option,
  IconButton,
} from '@mui/joy';
import PropTypes from 'prop-types';
import DeleteIcon from '@mui/icons-material/Delete';
import DropdownsAndInput from './DropdownsAndInput';

export default function FilterModal({ open, onClose, entity, id }) {
  const [conditions, setConditions] = useState([]);

  const addCondition = () => {
    setConditions((prev) => [...prev, { id: Date.now() }]);
  };

  const removeCondition = (id) => {
    setConditions((prev) => prev.filter((condition) => condition.id !== id));
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog variant='plain'>
        <ModalClose />
        <Typography>Build your filter for {entity}</Typography>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-row items-center'>
            <Typography sx={{ mr: 8.3 }}>Where</Typography>
            <DropdownsAndInput
              id={id}
              sx={{ borderTopLeftRadius: 1, borderBottomLeftRadius: 1 }}
            />
          </div>
          {conditions.map((condition) => (
            <div key={condition.id} className='flex flex-row items-center'>
              <Select sx={{ width: 90, mr: 3 }} defaultValue='and'>
                <Option value='and'>AND</Option>
                <Option value='or'>OR</Option>
              </Select>
              <DropdownsAndInput id={id} />
              <IconButton
                variant='outlined'
                sx={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                onClick={() => removeCondition(condition.id)}
              >
                <DeleteIcon />
              </IconButton>
            </div>
          ))}
        </div>
        <div className='flex flex-row gap-2 mt-2'>
          <Button variant='plain' color='neutral' onClick={addCondition}>
            + Add condition
          </Button>
          <Button variant='plain' color='neutral'>
            + Add condition group
          </Button>
        </div>
      </ModalDialog>
    </Modal>
  );
}

FilterModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  entity: PropTypes.string,
  id: PropTypes.number.isRequired,
};
