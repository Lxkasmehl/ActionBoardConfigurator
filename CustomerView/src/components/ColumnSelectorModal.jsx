import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  FormControl,
  FormLabel,
  Checkbox,
  Button,
  Stack,
  Box,
} from '@mui/joy';
import { useSelector, useDispatch } from 'react-redux';
import { setVisibleColumns } from '../redux/uiStateSlice';

export default function ColumnSelectorModal({
  open,
  onClose,
  componentId,
  columnOptions = [],
  tableComponentId,
}) {
  const dispatch = useDispatch();
  const visibleColumns = useSelector(
    (state) => state.uiState.visibleColumns[tableComponentId] || []
  );

  const [selectedColumns, setSelectedColumns] = useState([]);

  useEffect(() => {
    if (open) {
      setSelectedColumns(visibleColumns);
    }
  }, [open, visibleColumns]);

  const handleColumnToggle = (columnId) => {
    setSelectedColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    );
  };

  const handleSelectAll = () => {
    setSelectedColumns(columnOptions.map((option) => option.value));
  };

  const handleSelectNone = () => {
    setSelectedColumns([]);
  };

  const handleApply = () => {
    dispatch(
      setVisibleColumns({
        tableComponentId,
        columns: selectedColumns,
      })
    );
    onClose();
  };

  const handleClose = () => {
    setSelectedColumns(visibleColumns);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog sx={{ maxWidth: 400 }}>
        <ModalClose />
        <Typography level='h4' component='h2'>
          Select Columns
        </Typography>

        <Stack spacing={2} sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size='sm' variant='outlined' onClick={handleSelectAll}>
              Select All
            </Button>
            <Button size='sm' variant='outlined' onClick={handleSelectNone}>
              Select None
            </Button>
          </Box>

          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {columnOptions.map((option) => (
              <FormControl key={option.value} orientation='horizontal'>
                <Checkbox
                  checked={selectedColumns.includes(option.value)}
                  onChange={() => handleColumnToggle(option.value)}
                />
                <FormLabel sx={{ ml: 1 }}>{option.label}</FormLabel>
              </FormControl>
            ))}
          </Box>

          <Stack direction='row' spacing={1} sx={{ mt: 2 }}>
            <Button onClick={handleApply}>Apply Selection</Button>
            <Button variant='outlined' onClick={handleClose}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}
