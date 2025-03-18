import { Box, Card, Typography, Stack } from '@mui/joy';
import PropTypes from 'prop-types';
import { COMPONENT_CONFIGS } from './constants';

export default function ComponentLibrary({ onAddComponent }) {
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
        {Object.entries(COMPONENT_CONFIGS).map(([type, config]) => (
          <Card
            key={type}
            sx={{
              p: 2,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'background.level1',
              },
            }}
            onClick={() => onAddComponent(type)}
          >
            <Stack direction='row' spacing={2} alignItems='center'>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'background.level1',
                  borderRadius: 'sm',
                }}
              >
                <Typography>{config.icon}</Typography>
              </Box>
              <Typography>{config.label}</Typography>
            </Stack>
          </Card>
        ))}
      </Stack>
    </Card>
  );
}

ComponentLibrary.propTypes = {
  onAddComponent: PropTypes.func.isRequired,
};
