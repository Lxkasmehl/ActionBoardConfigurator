export const generateSortModal = () => {
  return `import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Modal,
  ModalDialog,
  Typography,
  FormControl,
  FormLabel,
  Button,
  Stack,
  RadioGroup,
  Radio,
  Autocomplete,
} from '@mui/joy';
import { setSortConfig } from '../redux/uiStateSlice';

export default function SortModal({ open, onClose, columnOptions, tableComponentId }) {
  const dispatch = useDispatch();
  const [selectedColumn, setSelectedColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleApply = () => {
    if (selectedColumn) {
      dispatch(setSortConfig({
        groupName: tableComponentId,
        config: {
          column: selectedColumn.label,
          direction: sortDirection
        }
      }));
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <Typography level='h4' component='h2'>
          Sort Table
        </Typography>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <FormControl>
            <FormLabel>Column</FormLabel>
            <Autocomplete
              placeholder='Select Column'
              value={selectedColumn}
              onChange={(_, value) => setSelectedColumn(value || '')}
              options={columnOptions}
              getOptionLabel={(option) => option?.label || ''}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Sort Direction</FormLabel>
            <RadioGroup
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value)}
            >
              <Radio value='asc' label='Ascending' />
              <Radio value='desc' label='Descending' />
            </RadioGroup>
          </FormControl>
          <Stack direction='row' spacing={1} justifyContent='flex-end'>
            <Button variant='plain' onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleApply}>Apply</Button>
          </Stack>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}`;
};
