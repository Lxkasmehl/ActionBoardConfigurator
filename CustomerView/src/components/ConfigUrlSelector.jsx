import React, { useState, useEffect } from 'react';
import {
  Box,
  Select,
  Option,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/joy';
import { Settings } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import {
  loadAvailableConfigs,
  setSelectedConfigId,
} from '../redux/configSelectorSlice';
import { updateUrlWithConfig } from '../utils/configUrl';

export default function ConfigUrlSelector() {
  const dispatch = useDispatch();
  const { availableConfigs, selectedConfigId, isLoading, error } = useSelector(
    (state) => state.configSelector
  );

  useEffect(() => {
    dispatch(loadAvailableConfigs());
  }, [dispatch]);

  const handleConfigSelect = (event, configId) => {
    dispatch(setSelectedConfigId(configId));
    updateUrlWithConfig(configId);
  };

  if (error) {
    return (
      <Alert color='danger' variant='soft' sx={{ m: 2, maxWidth: 400 }}>
        Error loading configs: {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Card variant='outlined' sx={{ maxWidth: 400 }}>
        <CardContent>
          <Typography level='h4' sx={{ mb: 2 }}>
            Configuration Selector
          </Typography>

          <Select
            placeholder='Select Configuration'
            value={selectedConfigId || ''}
            onChange={handleConfigSelect}
            startDecorator={<Settings />}
            sx={{ width: '100%' }}
            disabled={isLoading}
          >
            {isLoading && (
              <Option disabled>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                    py: 1,
                  }}
                >
                  <CircularProgress size='sm' />
                </Box>
              </Option>
            )}

            {availableConfigs.length === 0 && !isLoading && (
              <Option disabled>
                <Typography level='body-sm' color='neutral'>
                  No configurations available
                </Typography>
              </Option>
            )}

            {availableConfigs.map((config) => (
              <Option key={config.id} value={config.id}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}
                >
                  <Typography level='body-sm' sx={{ fontWeight: 'md' }}>
                    {config.name}
                  </Typography>
                  <Typography level='body-xs' color='neutral'>
                    Modified:{' '}
                    {new Date(config.lastModified).toLocaleDateString()}
                  </Typography>
                </Box>
              </Option>
            ))}

            {selectedConfigId && (
              <Option value=''>
                <Typography level='body-sm' color='danger'>
                  Clear Selection
                </Typography>
              </Option>
            )}
          </Select>

          {selectedConfigId && (
            <Box sx={{ mt: 2 }}>
              <Typography level='body-sm' color='success'>
                ✓ Configuration loaded from URL parameter
              </Typography>
              <Typography level='body-xs' color='neutral' sx={{ mt: 0.5 }}>
                URL: {window.location.href}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
