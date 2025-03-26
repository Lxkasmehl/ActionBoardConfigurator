import { useState } from 'react';
import PropTypes from 'prop-types';
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
  Input,
  Stack,
} from '@mui/joy';

export default function ChartEditModal({ open, onClose, component, onSave }) {
  const [editedComponent, setEditedComponent] = useState(component);
  const [dataInput, setDataInput] = useState('');

  const handleSave = () => {
    let parsedData = null;

    if (dataInput.trim()) {
      try {
        const numbers = dataInput
          .split(',')
          .map((num) => parseFloat(num.trim()));
        if (numbers.every((num) => !isNaN(num))) {
          parsedData = {
            xAxis: [
              {
                data:
                  editedComponent.props.type === 'bars'
                    ? Array.from({ length: numbers.length }, (_, i) =>
                        String.fromCharCode(65 + i),
                      )
                    : Array.from({ length: numbers.length }, (_, i) => i + 1),
                ...(editedComponent.props.type === 'bars' && {
                  scaleType: 'band',
                }),
              },
            ],
            series: [{ data: numbers }],
          };
        } else {
          parsedData = JSON.parse(dataInput);
          if (editedComponent.props.type === 'bars' && parsedData.xAxis) {
            parsedData.xAxis = parsedData.xAxis.map((axis) => ({
              ...axis,
              scaleType: 'band',
            }));
          }
        }
      } catch (error) {
        console.error('Invalid data format:', error);
        return;
      }
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    } else if (e.key === ' ') {
      e.preventDefault();
      setDataInput((prev) => prev + ' ');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <ModalClose onClick={onClose} />
        <Typography level='h4'>Edit Chart</Typography>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <FormControl>
            <FormLabel>Chart Type</FormLabel>
            <Select
              value={editedComponent.props.type}
              onChange={(_, value) =>
                setEditedComponent({
                  ...editedComponent,
                  props: { ...editedComponent.props, type: value },
                })
              }
              sx={{ minWidth: 200 }}
            >
              <Option value='lines'>Line Chart</Option>
              <Option value='bars'>Bar Chart</Option>
              <Option value='pie'>Pie Chart</Option>
              <Option value='scatter'>Scatter Chart</Option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Chart Data (optional)</FormLabel>
            <Input
              value={dataInput}
              onChange={(e) => setDataInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Enter numbers separated by commas (e.g., 1, 2, 3, 4, 5)'
              helperText='Leave empty to use sample data'
            />
          </FormControl>

          <Stack direction='row' spacing={1} justifyContent='flex-end'>
            <Button variant='plain' color='neutral' onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
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
};
