import React, { useState } from 'react';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  FormControl,
  FormLabel,
  Select,
  Option,
  Button,
  Stack,
  Radio,
  RadioGroup,
} from '@mui/joy';

export default function SortModal({
  open,
  onClose,
  columnOptions = [],
  tableComponentId,
  onApplySort,
}) {
  const [selectedField, setSelectedField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleApply = () => {
    if (selectedField) {
      onApplySort?.(selectedField, sortDirection);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedField('');
    setSortDirection('asc');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog>
        <ModalClose />
        <Typography level='h4' component='h2'>
          Sort Data
        </Typography>

        <Stack spacing={2} sx={{ mt: 2 }}>
          <FormControl>
            <FormLabel>Sort by column</FormLabel>
            <Select
              value={selectedField}
              onChange={(event, newValue) => setSelectedField(newValue)}
              placeholder='Select a column'
            >
              {columnOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Sort direction</FormLabel>
            <RadioGroup
              value={sortDirection}
              onChange={(event) => setSortDirection(event.target.value)}
            >
              <Radio value='asc' label='Ascending' />
              <Radio value='desc' label='Descending' />
            </RadioGroup>
          </FormControl>

          <Stack direction='row' spacing={1} sx={{ mt: 2 }}>
            <Button onClick={handleApply} disabled={!selectedField}>
              Apply Sort
            </Button>
            <Button variant='outlined' onClick={handleClose}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}
