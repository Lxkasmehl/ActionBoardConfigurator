import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  MenuButton,
  Dropdown,
  Typography,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/joy';
import { Settings } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import {
  loadAvailableConfigs,
  setSelectedConfigId,
} from '../redux/configSelectorSlice';

export default function ConfigSelectorFloating() {
  const dispatch = useDispatch();
  const { availableConfigs, selectedConfigId, isLoading, error } = useSelector(
    (state) => state.configSelector
  );

  useEffect(() => {
    dispatch(loadAvailableConfigs());
  }, [dispatch]);

  const handleConfigSelect = (configId) => {
    dispatch(setSelectedConfigId(configId));
  };

  const getCurrentConfigName = () => {
    if (!selectedConfigId) return 'No config selected';
    const config = availableConfigs.find((c) => c.id === selectedConfigId);
    return config ? config.name : 'Unknown config';
  };

  if (error) {
    return (
      <Alert color='danger' variant='soft' sx={{ m: 1, maxWidth: 300 }}>
        Error loading configs: {error}
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1000,
      }}
    >
      <Dropdown>
        <MenuButton
          slots={{ root: IconButton }}
          slotProps={{
            root: {
              variant: 'soft',
              color: selectedConfigId ? 'primary' : 'neutral',
              sx: {
                backgroundColor: selectedConfigId
                  ? 'primary.100'
                  : 'neutral.100',
                '&:hover': {
                  backgroundColor: selectedConfigId
                    ? 'primary.200'
                    : 'neutral.200',
                },
              },
            },
          }}
        >
          <Settings />
        </MenuButton>
        <Menu placement='bottom-end' sx={{ minWidth: 200 }}>
          {isLoading && (
            <MenuItem disabled>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                }}
              >
                <CircularProgress size='sm' />
              </Box>
            </MenuItem>
          )}

          {availableConfigs.length === 0 && !isLoading && (
            <MenuItem disabled>
              <Typography level='body-sm' color='neutral'>
                No configurations available
              </Typography>
            </MenuItem>
          )}

          {availableConfigs.map((config) => (
            <MenuItem
              key={config.id}
              onClick={() => handleConfigSelect(config.id)}
              selected={config.id === selectedConfigId}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                py: 1.5,
              }}
            >
              <Typography level='body-sm' sx={{ fontWeight: 'md' }}>
                {config.name}
              </Typography>
              <Typography level='body-xs' color='neutral'>
                Modified: {new Date(config.lastModified).toLocaleDateString()}
              </Typography>
            </MenuItem>
          ))}

          {selectedConfigId && (
            <MenuItem
              onClick={() => handleConfigSelect(null)}
              sx={{
                color: 'danger.500',
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              Clear Selection
            </MenuItem>
          )}
        </Menu>
      </Dropdown>
    </Box>
  );
}
