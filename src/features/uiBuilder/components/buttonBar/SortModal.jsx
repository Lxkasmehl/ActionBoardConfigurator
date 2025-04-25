import { useState } from 'react';
import PropTypes from 'prop-types';
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
import { useTableColumns } from '../../hooks/useTableColumns';

export default function SortModal({ open, onClose, onApplySort, componentId }) {
  const [selectedColumn, setSelectedColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  const { getColumnOptions } = useTableColumns(componentId);

  const handleApply = () => {
    if (selectedColumn) {
      onApplySort(selectedColumn.label, sortDirection);
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
              options={getColumnOptions()}
              getOptionLabel={(option) => option?.label || ''}
              data-testid='sort-column-select'
            />
          </FormControl>
          <FormControl>
            <FormLabel>Sort Direction</FormLabel>
            <RadioGroup
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value)}
            >
              <Radio
                value='asc'
                label='Ascending'
                data-testid='sort-asc-radio'
              />
              <Radio
                value='desc'
                label='Descending'
                data-testid='sort-desc-radio'
              />
            </RadioGroup>
          </FormControl>
          <Stack direction='row' spacing={1} justifyContent='flex-end'>
            <Button variant='plain' onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleApply} data-testid='sort-apply-button'>
              Apply
            </Button>
          </Stack>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}

SortModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onApplySort: PropTypes.func.isRequired,
  componentId: PropTypes.string.isRequired,
};
