import React from 'react';
import { Box, Typography, Button, Card } from '@mui/joy';
import { Settings } from '@mui/icons-material';

export default function NoConfigSelected({ onOpenConfigSelector }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        p: 4,
      }}
    >
      <Card
        variant='outlined'
        sx={{
          p: 4,
          textAlign: 'center',
          maxWidth: 400,
        }}
      >
        <Box>
          <Settings sx={{ fontSize: 48 }} />
        </Box>

        <Typography level='h4' sx={{ mb: 1 }}>
          No Configuration Selected
        </Typography>

        <Typography level='body-md' color='neutral'>
          Please click the settings icon in the top-right corner to select a
          configuration.
        </Typography>
      </Card>
    </Box>
  );
}
