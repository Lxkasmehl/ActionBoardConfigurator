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
} from '@mui/joy';
import { Add } from '@mui/icons-material';
import * as Icons from '@mui/icons-material';
import { PREDEFINED_BUTTONS } from './predefinedButtons';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableButton from './SortableButton';
import { ButtonBarPointerSensor } from '../../utils/buttonBarPointerSensor';

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

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setCurrentButtons((items) => {
        const oldIndex = items.findIndex(
          (item) => item['text/icon'] === active.id,
        );
        const newIndex = items.findIndex(
          (item) => item['text/icon'] === over.id,
        );

        return arrayMove(items, oldIndex, newIndex);
      });
    }
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

  const sensors = useSensors(
    useSensor(ButtonBarPointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={currentButtons.map((button) => button['text/icon'])}
              strategy={verticalListSortingStrategy}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                  flexDirection: 'column',
                }}
              >
                {currentButtons.map((button, index) => (
                  <SortableButton
                    key={button['text/icon']}
                    button={button}
                    index={index}
                    onRemove={handleRemoveButton}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

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
            <Button onClick={handleSave} data-testid='button-bar-save-button'>
              Save
            </Button>
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
