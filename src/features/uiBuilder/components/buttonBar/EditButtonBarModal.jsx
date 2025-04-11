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
import { PREDEFINED_BUTTONS } from './predefinedButtons';
import ButtonField from './ButtonField';

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
                <Tooltip title={button.description}>
                  <div>
                    <ButtonField field={button} />
                  </div>
                </Tooltip>
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
