import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  FormControl,
  FormLabel,
  Autocomplete,
  Button,
  Stack,
  FormHelperText,
  Alert,
} from '@mui/joy';
import { useTableColumns } from '../../hooks/useTableColumns';
import { useSelector } from 'react-redux';

export default function ChartEditModal({
  open,
  onClose,
  component,
  onSave,
  componentId,
}) {
  const [editedComponent, setEditedComponent] = useState(component);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const { tableComponentId, getColumnOptions } = useTableColumns(componentId);
  const tableData = useSelector(
    (state) => state.uiBuilder.tableData[tableComponentId] || [],
  );

  // Get column options - now stable due to memoization in useTableColumns
  const columnOptions = getColumnOptions();
  const hasTableConnection = !!tableComponentId;

  // Only reset when modal opens and component actually changes
  useEffect(() => {
    if (open && editedComponent.id !== component.id) {
      setEditedComponent(component);
      setSelectedColumn(null);
    }
  }, [open, component.id, editedComponent.id, component]);

  const handleSave = () => {
    if (!hasTableConnection) {
      onSave({
        ...editedComponent,
        props: {
          ...editedComponent.props,
          data: null,
        },
      });
      onClose();
      return;
    }

    if (!selectedColumn || !tableData.length) {
      onSave({
        ...editedComponent,
        props: {
          ...editedComponent.props,
          data: null,
        },
      });
      onClose();
      return;
    }

    const columnLabel = selectedColumn.label;
    const columnData = tableData.map((row) => row[columnLabel]);

    // Count occurrences for categorical data (like cities)
    const valueCounts = columnData.reduce((acc, value) => {
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});

    let parsedData = null;

    if (editedComponent.props.type === 'bars') {
      // For bar charts, use the unique values as categories
      const categories = Object.keys(valueCounts);
      parsedData = {
        xAxis: [
          {
            data: categories,
            scaleType: 'band',
          },
        ],
        series: [{ data: categories.map((cat) => valueCounts[cat]) }],
      };
    } else if (editedComponent.props.type === 'pie') {
      // For pie charts, create data in the format: [{ value: number, label: string }]
      parsedData = {
        series: [
          {
            data: Object.entries(valueCounts).map(([label, value]) => ({
              value,
              label,
            })),
          },
        ],
      };
    }

    onSave({
      ...editedComponent,
      props: {
        ...editedComponent.props,
        data: parsedData,
      },
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <ModalClose onClick={onClose} />
        <Typography level='h4'>Edit Chart</Typography>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {!hasTableConnection && (
            <Alert color='warning'>
              This chart is not connected to a table component. Sample data will
              be used.
            </Alert>
          )}

          <FormControl>
            <FormLabel>Chart Type</FormLabel>
            <Autocomplete
              value={editedComponent.props.type}
              options={[
                { value: 'bars', label: 'Bar Chart' },
                { value: 'pie', label: 'Pie Chart' },
              ]}
              getOptionLabel={(option) => {
                if (typeof option === 'string') {
                  return option === 'bars' ? 'Bar Chart' : 'Pie Chart';
                }
                return option.label;
              }}
              isOptionEqualToValue={(option, value) => {
                if (typeof value === 'string') {
                  return option.value === value;
                }
                return option.value === value?.value;
              }}
              onChange={(_, value) =>
                setEditedComponent({
                  ...editedComponent,
                  props: { ...editedComponent.props, type: value?.value },
                })
              }
              placeholder='Select chart type'
              sx={{ minWidth: 200 }}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Data Source</FormLabel>
            {hasTableConnection ? (
              <>
                <Autocomplete
                  value={selectedColumn}
                  options={columnOptions}
                  getOptionLabel={(option) => {
                    if (typeof option === 'string') {
                      return option;
                    }
                    return option?.label || '';
                  }}
                  isOptionEqualToValue={(option, value) => {
                    if (typeof value === 'string') {
                      return option.value === value;
                    }
                    return option.value === value?.value;
                  }}
                  onChange={(_, value) => setSelectedColumn(value)}
                  placeholder='Select data column'
                  sx={{ minWidth: 200 }}
                  data-testid='chart-data-source-select'
                />
                <FormHelperText>
                  Select a column from the table in the same group
                </FormHelperText>
              </>
            ) : (
              <FormHelperText>
                Please connect this chart to a table component to select data.
              </FormHelperText>
            )}
          </FormControl>

          <Stack direction='row' spacing={1} justifyContent='flex-end'>
            <Button variant='plain' color='neutral' onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} data-testid='chart-save-button'>
              Save
            </Button>
          </Stack>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}

ChartEditModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  component: PropTypes.shape({
    id: PropTypes.string.isRequired,
    props: PropTypes.shape({
      type: PropTypes.string.isRequired,
      data: PropTypes.object,
    }).isRequired,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  componentId: PropTypes.string.isRequired,
};
