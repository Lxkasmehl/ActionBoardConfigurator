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
    (state) => state.uiState.visibleColumns[tableComponentId] || [],
  );
  const [selectedColumns, setSelectedColumns] = useState([]);
  const isInitialized = useRef(false);

  // Initialize selected columns when modal opens
  useEffect(() => {
    if (open && !isInitialized.current) {
      const allColumnIds = columnOptions.map((option) => option.value);

      // If no visible columns are set in Redux, select all columns
      if (visibleColumns.length === 0) {
        setSelectedColumns(allColumnIds);
      } else {
        // Use visibleColumns from Redux, but ensure all available columns are included
        const selectedIds = visibleColumns.filter((id) =>
          allColumnIds.includes(id),
        );
        // If no columns are selected in Redux, select all (fallback for default behavior)
        setSelectedColumns(selectedIds.length > 0 ? selectedIds : allColumnIds);
      }
      isInitialized.current = true;
    } else if (!open) {
      isInitialized.current = false;
    }
  }, [open, visibleColumns, columnOptions]);

  const handleApply = () => {
    if (tableComponentId) {
      dispatch(
        setVisibleColumns({ tableComponentId, columns: selectedColumns }),
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
                  data-testid={`column-selector-checkbox-${column.label}`}
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
            <Button
              onClick={handleApply}
              data-testid='column-selector-apply-button'
            >
              Apply
            </Button>
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
  columnOptions: PropTypes.array,
  tableComponentId: PropTypes.string,
};
