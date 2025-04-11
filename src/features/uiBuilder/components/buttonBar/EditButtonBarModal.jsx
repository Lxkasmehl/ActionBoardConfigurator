import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalDialog,
  Typography,
  Button,
  Stack,
  List,
  ListItem,
  ListItemButton,
  ListItemDecorator,
  IconButton,
  Divider,
  Tooltip,
} from '@mui/joy';
import { Delete, Add } from '@mui/icons-material';
import * as Icons from '@mui/icons-material';
import { Autocomplete } from '@mui/joy';

// Predefined button configurations
const PREDEFINED_BUTTONS = [
  {
    type: 'button',
    'text/icon': 'Apply filter',
    label: 'Apply Filter',
    description: 'Applies the current filter settings',
    onClick: () => console.log('Applying filters...'),
  },
  {
    type: 'button',
    'text/icon': 'Clear all filter',
    label: 'Clear Filters',
    description: 'Clears all applied filters',
    onClick: () => console.log('Clearing all filters...'),
  },
  {
    type: 'iconButton',
    'text/icon': 'Settings',
    label: 'Settings',
    description: 'Open settings menu',
    onClick: () => console.log('Opening settings...'),
  },
  {
    type: 'iconButton',
    'text/icon': 'Refresh',
    label: 'Refresh',
    description: 'Refresh the current view',
    onClick: () => console.log('Refreshing view...'),
  },
  {
    type: 'iconButton',
    'text/icon': 'Download',
    label: 'Download',
    description: 'Download current data',
    onClick: () => console.log('Downloading data...'),
  },
  {
    type: 'autocomplete',
    'text/icon': 'Templates',
    label: 'Templates',
    description: 'Select from available templates',
    onClick: () => console.log('Opening templates...'),
  },
  {
    type: 'autocomplete',
    'text/icon': 'Search',
    label: 'Search',
    description: 'Search within the current view',
    onClick: () => console.log('Initiating search...'),
  },
];

const getIconComponent = (iconName) => {
  const Icon = Icons[iconName];
  return Icon ? <Icon /> : null;
};

export default function EditButtonBarModal({
  open,
  onClose,
  component,
  onSave,
}) {
  const [currentButtons, setCurrentButtons] = useState(component.props.fields);

  const availableButtons = PREDEFINED_BUTTONS.filter(
    (button) =>
      !currentButtons.some(
        (current) => current['text/icon'] === button['text/icon'],
      ),
  );

  const handleAddButton = (button) => {
    setCurrentButtons([...currentButtons, button]);
  };

  const handleRemoveButton = (index) => {
    setCurrentButtons(currentButtons.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave({
      ...component,
      props: {
        ...component.props,
        fields: currentButtons,
      },
    });
    onClose();
  };

  const renderField = (field, index) => {
    let IconComponent;
    switch (field.type) {
      case 'iconButton':
        IconComponent = Icons[field['text/icon']];
        return (
          <div key={index} className='relative group'>
            <Tooltip title={field.description}>
              <IconButton
                size='sm'
                variant='solid'
                color='primary'
                className='group-hover:opacity-50 transition-opacity'
              >
                <IconComponent />
              </IconButton>
            </Tooltip>
          </div>
        );
      case 'autocomplete':
        return (
          <div key={index} className='relative group'>
            <Tooltip title={field.description}>
              <Autocomplete
                size='sm'
                placeholder={field['text/icon']}
                options={[]}
                className='group-hover:opacity-50 transition-opacity'
                sx={{
                  width: '170px',
                }}
              />
            </Tooltip>
          </div>
        );
      case 'button':
      default:
        return (
          <div key={index} className='relative group'>
            <Tooltip title={field.description}>
              <Button
                size='sm'
                className='group-hover:opacity-50 transition-opacity'
              >
                {field['text/icon']}
              </Button>
            </Tooltip>
          </div>
        );
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        variant='outlined'
        sx={{
          maxWidth: '500px',
          minWidth: '400px',
          width: 'fit-content',
        }}
      >
        <Typography level='h4' mb={2}>
          Edit Button Bar
        </Typography>

        <Stack spacing={2}>
          <Typography level='title-sm'>Current Buttons</Typography>
          <div className='flex gap-2 flex-wrap flex-col'>
            {currentButtons.map((button, index) => (
              <div key={index} className='relative group'>
                {renderField(button, index)}
                <IconButton
                  variant='plain'
                  color='danger'
                  onClick={() => handleRemoveButton(index)}
                  sx={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    borderRadius: '50%',
                    padding: '2px',
                    fontSize: '0.75rem',
                  }}
                >
                  <Delete fontSize='small' />
                </IconButton>
              </div>
            ))}
          </div>

          <Divider />

          <Typography level='title-sm'>Available Buttons</Typography>
          <List>
            {availableButtons.map((button, index) => (
              <ListItem
                key={index}
                endAction={
                  <IconButton
                    variant='plain'
                    color='primary'
                    onClick={() => handleAddButton(button)}
                  >
                    <Add />
                  </IconButton>
                }
              >
                <ListItemDecorator>
                  {button.type === 'iconButton' ? (
                    <>{getIconComponent(button['text/icon'])}</>
                  ) : null}
                </ListItemDecorator>
                <ListItemButton onClick={() => handleAddButton(button)}>
                  <Stack>
                    <Typography level='body-sm'>{button.label}</Typography>
                    <Typography level='body-xs' color='neutral'>
                      {button.description}
                    </Typography>
                  </Stack>
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Stack direction='row' spacing={1} justifyContent='flex-end' mt={2}>
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

EditButtonBarModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  component: PropTypes.shape({
    props: PropTypes.shape({
      fields: PropTypes.arrayOf(
        PropTypes.shape({
          type: PropTypes.string.isRequired,
          'text/icon': PropTypes.string.isRequired,
          onClick: PropTypes.func.isRequired,
        }),
      ).isRequired,
    }).isRequired,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
};
