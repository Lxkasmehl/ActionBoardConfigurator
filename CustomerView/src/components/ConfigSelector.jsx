import React, { useState, useEffect } from 'react';
import {
  Box,
  Select,
  Option,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Card,
  Chip,
} from '@mui/joy';
import { useSelector, useDispatch } from 'react-redux';
import {
  loadAvailableConfigs,
  setSelectedConfigId,
} from '../redux/configSelectorSlice';
import { useAppConfig } from '../hooks/useAppConfig';

export default function ConfigSelector() {
  const dispatch = useDispatch();
  const { availableConfigs, selectedConfigId, isLoading, error } = useSelector(
    (state) => state.configSelector
  );

  const [localSelectedId, setLocalSelectedId] = useState(
    selectedConfigId || '01'
  );

  useEffect(() => {
    dispatch(loadAvailableConfigs());
  }, [dispatch]);

  useEffect(() => {
    setLocalSelectedId(selectedConfigId || '01');
  }, [selectedConfigId]);

  const handleConfigChange = (event, newValue) => {
    setLocalSelectedId(newValue);
  };

  const handleLoadConfig = () => {
    dispatch(setSelectedConfigId(localSelectedId));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert color='danger' variant='soft' sx={{ m: 2 }}>
        Error loading configurations: {error}
      </Alert>
    );
  }

  return (
    <Card sx={{ m: 2, p: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography level='title-lg'>Configuration Selector</Typography>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Select
            placeholder='Select a configuration...'
            value={localSelectedId}
            onChange={handleConfigChange}
            sx={{ minWidth: 200 }}
          >
            <Option value='01'>Default Configuration (Legacy)</Option>
            {availableConfigs.map((config) => (
              <Option key={config.id} value={config.id}>
                {config.name}
              </Option>
            ))}
          </Select>

          <Button
            variant='solid'
            color='primary'
            onClick={handleLoadConfig}
            disabled={!localSelectedId}
          >
            Load Configuration
          </Button>
        </Box>

        {selectedConfigId && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography level='body-sm'>Current:</Typography>
            <Chip color='primary' variant='soft'>
              {selectedConfigId === '01'
                ? 'Default Configuration'
                : availableConfigs.find((c) => c.id === selectedConfigId)
                    ?.name || selectedConfigId}
            </Chip>
          </Box>
        )}

        {availableConfigs.length > 0 && (
          <Box>
            <Typography level='body-sm' color='neutral' sx={{ mb: 1 }}>
              Available configurations:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {availableConfigs.map((config) => (
                <Chip
                  key={config.id}
                  variant={
                    config.id === selectedConfigId ? 'solid' : 'outlined'
                  }
                  color={config.id === selectedConfigId ? 'primary' : 'neutral'}
                  size='sm'
                >
                  {config.name}
                </Chip>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Card>
  );
}
