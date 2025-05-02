export const generateColumnSelectorModal = () => {
  return `
  import {
    Modal,
    ModalDialog,
    Typography,
    FormLabel,
    Button,
    Stack,
    Checkbox,
    List,
    ListItem,
    ListItemButton,
    ListItemDecorator,
  } from '@mui/joy';
  import { useState, useEffect } from 'react';
  import { useDispatch, useSelector } from 'react-redux';
  import { setVisibleColumns } from '../redux/uiStateSlice';
  
  export default function ColumnSelectorModal({ open, onClose, componentId, columnOptions, tableComponentId }) {
    const dispatch = useDispatch();
    const [selectedColumns, setSelectedColumns] = useState([]);
    const visibleColumns = useSelector((state) => state.uiState.visibleColumns[tableComponentId] || []);

    // Initialize selected columns when modal opens
    useEffect(() => {
      if (open) {
        // If no visible columns are set, select all columns
        if (visibleColumns.length === 0) {
          setSelectedColumns(columnOptions.map(option => option.value));
        } else {
          setSelectedColumns(visibleColumns);
        }
      }
    }, [open, visibleColumns, columnOptions]);

    const handleToggleColumn = (columnId) => {
      setSelectedColumns(prev => 
        prev.includes(columnId)
          ? prev.filter(id => id !== columnId)
          : [...prev, columnId]
      );
    };

    const handleApply = () => {
      dispatch(setVisibleColumns({ tableComponentId, columns: selectedColumns }));
      onClose();
    };

    return (
      <Modal open={open} onClose={onClose}>
        <ModalDialog>
          <Typography level='h4' component='h2'>
            Select Columns
          </Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <FormLabel>Visible Columns</FormLabel>
            <List>
              {columnOptions.map((column) => (
                <ListItem key={column.value}>
                  <ListItemButton
                    onClick={() => handleToggleColumn(column.value)}
                  >
                    <ListItemDecorator>
                      <Checkbox
                        checked={selectedColumns.includes(column.value)}
                        onChange={() => handleToggleColumn(column.value)}
                      />
                    </ListItemDecorator>
                    {column.label}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
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
