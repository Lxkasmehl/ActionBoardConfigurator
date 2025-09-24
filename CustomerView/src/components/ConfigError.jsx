import React from 'react';
import { Box, Typography, Card, Alert } from '@mui/joy';
import { ErrorOutline, Settings } from '@mui/icons-material';
import ConfigUrlSelector from './ConfigUrlSelector';

export default function ConfigError({ error, configId }) {
  const getErrorMessage = () => {
    if (error.includes('not found')) {
      return `The configuration "${configId}" could not be found.`;
    } else if (error.includes('Permission denied')) {
      return 'You do not have permission to access this configuration.';
    } else if (error.includes('network') || error.includes('fetch')) {
      return 'Network error occurred while loading the configuration.';
    } else {
      return 'An error occurred while loading the configuration.';
    }
  };

  const getErrorType = () => {
    if (error.includes('not found')) {
      return 'Configuration Not Found';
    } else if (error.includes('Permission denied')) {
      return 'Access Denied';
    } else if (error.includes('network') || error.includes('fetch')) {
      return 'Network Error';
    } else {
      return 'Configuration Error';
    }
  };

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
          <ErrorOutline sx={{ fontSize: 48, color: 'danger.500' }} />
        </Box>

        <Typography level='h4' sx={{ mb: 1, color: 'danger.500' }}>
          {getErrorType()}
        </Typography>

        <Typography level='body-md' color='neutral' sx={{ mb: 2 }}>
          {getErrorMessage()}
        </Typography>

        <Alert color='danger' variant='soft' sx={{ mb: 2 }}>
          <Typography level='body-sm'>
            <strong>Error Details:</strong> {error}
          </Typography>
        </Alert>

        <Typography level='body-sm' color='neutral' sx={{ mb: 2 }}>
          Please select a valid configuration from the list below or check the
          URL parameter.
        </Typography>

        <Typography level='body-xs' color='neutral'>
          Current URL: <code>{window.location.href}</code>
        </Typography>
      </Card>

      <ConfigUrlSelector />
    </Box>
  );
}
