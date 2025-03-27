import { Card, Typography, Stack } from '@mui/joy';
import { COMPONENT_CONFIGS } from '../common/constants';
import DraggableComponent from '../dragAndDrop/DraggableComponent';

export default function ComponentLibrary() {
  const disabledComponents = ['Image', 'Button'];

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
    </Card>
  );
}
