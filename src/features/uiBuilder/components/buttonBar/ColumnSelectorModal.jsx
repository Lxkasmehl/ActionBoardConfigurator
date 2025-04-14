import { useState, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
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
import { useTableColumns } from '../../hooks/useTableColumns';
import { useSelector, useDispatch } from 'react-redux';
import { setVisibleColumns } from '../../../../redux/uiBuilderSlice';

export default function ColumnSelectorModal({ open, onClose, componentId }) {
  const dispatch = useDispatch();
  const { getColumnOptions, tableComponentId } = useTableColumns(componentId);
  const visibleColumns = useSelector(
    (state) => state.uiBuilder.visibleColumns[tableComponentId] || [],
  );
  const [selectedColumns, setSelectedColumns] = useState([]);
  const isInitialized = useRef(false);

  const columnOptions = useMemo(() => getColumnOptions(), [getColumnOptions]);
  const columnIds = useMemo(
    () => columnOptions.map((option) => option.value),
    [columnOptions],
  );

  // Initialize selected columns when modal opens
  useEffect(() => {
    if (open && !isInitialized.current) {
      // If no visible columns are set, select all columns
      if (visibleColumns.length === 0) {
        setSelectedColumns(columnIds);
      } else {
        setSelectedColumns(visibleColumns);
      }
      isInitialized.current = true;
    } else if (!open) {
      isInitialized.current = false;
    }
  }, [open, visibleColumns, columnIds]);

  const handleApply = () => {
    if (tableComponentId) {
      dispatch(
        setVisibleColumns({ tableComponentId, columnIds: selectedColumns }),
      );
    }
    onClose();
  };

  const handleToggleColumn = (columnId) => {
    setSelectedColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId],
    );
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
}

ColumnSelectorModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  componentId: PropTypes.string.isRequired,
};
