import { Card, Typography, Stack, Button, Box } from '@mui/joy';
import { COMPONENT_CONFIGS } from '../common/constants';
import DraggableComponent from '../dragAndDrop/DraggableComponent';
import { useDispatch, useSelector } from 'react-redux';
import {
  setIsInGroupMode,
  saveSelectedComponents,
  clearSelectedComponents,
} from '@/redux/uiBuilderSlice';

export default function ComponentLibrary() {
  const disabledComponents = ['Image', 'Button'];
  const dispatch = useDispatch();
  const isInGroupMode = useSelector((state) => state.uiBuilder.isInGroupMode);

  const handleSave = () => {
    dispatch(saveSelectedComponents());
    dispatch(setIsInGroupMode(false));
  };

  const handleCancel = () => {
    dispatch(clearSelectedComponents());
    dispatch(setIsInGroupMode(false));
  };

  return (
    <Card
      sx={{
        width: 300,
        height: '100%',
        overflowY: 'auto',
        p: 2,
      }}
    >
      <Typography level='h4' mb={2}>
        Components
      </Typography>
      <Stack spacing={2}>
        {Object.entries(COMPONENT_CONFIGS).map(([type, config], index) => (
          <DraggableComponent
            key={type}
            type={type}
            config={config}
            index={index}
            disabled={disabledComponents.includes(config.label)}
          />
        ))}
      </Stack>
      <Box sx={{ flexGrow: 1 }}></Box>
      {isInGroupMode ? (
        <div className='flex flex-row gap-1 z-20'>
          <Button color='danger' onClick={handleCancel} sx={{ flex: 1 }}>
            Cancel
          </Button>
          <Button color='success' sx={{ flex: 1 }} onClick={handleSave}>
            Save
          </Button>
        </div>
      ) : (
        <Button onClick={() => dispatch(setIsInGroupMode(true))}>
          Create Group
        </Button>
      )}
    </Card>
  );
}
