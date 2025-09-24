import React from 'react';
import { Box, Typography, Card } from '@mui/joy';
import { Settings } from '@mui/icons-material';
import ConfigUrlSelector from './ConfigUrlSelector';

export default function NoConfigSelected() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        p: 4,
        gap: 3,
      }}
    >
      <Card
        variant='outlined'
        sx={{
          p: 4,
          textAlign: 'center',
          maxWidth: 500,
        }}
      >
        <Box>
          <Settings sx={{ fontSize: 48 }} />
        </Box>

        <Typography level='h4' sx={{ mb: 1 }}>
          No Configuration Selected
        </Typography>

        <Typography level='body-md' color='neutral' sx={{ mb: 2 }}>
          Please select a configuration using the URL parameter or the selector
          below.
        </Typography>

        <Typography level='body-sm' color='neutral'>
          You can also add <code>?config=YOUR_CONFIG_ID</code> to the URL to
          load a specific configuration.
        </Typography>
      </Card>

      <ConfigUrlSelector />
    </Box>
  );
}
