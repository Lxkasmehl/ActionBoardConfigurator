import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  Chip,
  FormControl,
  FormLabel,
} from '@mui/joy';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Save,
  FolderOpen,
  Add,
  Delete,
  MoreVert,
  Edit,
  ContentCopy,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import {
  loadAvailableConfigs,
  loadConfig,
  saveConfig,
  deleteConfig,
  clearCurrentConfig,
} from '../../../../redux/configManagementSlice';

export default function ConfigManagement() {
  const dispatch = useDispatch();
  const {
    availableConfigs,
    currentConfigId,
    currentConfigName,
    isLoading,
    error,
    lastSaved,
  } = useSelector((state) => state.configManagement);

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [configName, setConfigName] = useState('');
  const [isNewConfig, setIsNewConfig] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedConfigId, setSelectedConfigId] = useState(null);

  useEffect(() => {
    dispatch(loadAvailableConfigs());
  }, [dispatch]);

  const handleSaveConfig = async () => {
    if (!configName.trim()) return;

    try {
      await dispatch(saveConfig(configName, isNewConfig)).unwrap();
      setSaveDialogOpen(false);
      setConfigName('');
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  const handleLoadConfig = async (configId) => {
    try {
      await dispatch(loadConfig(configId)).unwrap();
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const handleDeleteConfig = async (configId) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      try {
        await dispatch(deleteConfig(configId)).unwrap();
      } catch (error) {
        console.error('Failed to delete config:', error);
      }
    }
  };

  const handleSaveAsNew = () => {
    setIsNewConfig(true);
    setConfigName('');
    setSaveDialogOpen(true);
  };

  const handleSaveOverwrite = () => {
    if (currentConfigId) {
      setIsNewConfig(false);
      setConfigName(currentConfigName || '');
      setSaveDialogOpen(true);
    }
  };

  const handleMenuOpen = (event, configId) => {
    setMenuAnchor(event.currentTarget);
    setSelectedConfigId(configId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedConfigId(null);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <Box
      sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}
    >
      {/* Current Config Info */}
      {currentConfigId && (
        <Chip color='primary' variant='soft' startDecorator={<FolderOpen />}>
          {currentConfigName}
        </Chip>
      )}

      {/* Save Buttons */}
      <Button
        variant='solid'
        color='primary'
        startDecorator={<Save />}
        onClick={handleSaveAsNew}
        disabled={isLoading}
        size='sm'
      >
        Save As New
      </Button>

      {currentConfigId && (
        <Button
          variant='outlined'
          color='primary'
          startDecorator={<Save />}
          onClick={handleSaveOverwrite}
          disabled={isLoading}
          size='sm'
        >
          Save Overwrite
        </Button>
      )}

      {/* Load Config Button */}
      <Button
        variant='outlined'
        startDecorator={<FolderOpen />}
        onClick={() => setLoadDialogOpen(true)}
        disabled={isLoading}
        size='sm'
      >
        Load Config
      </Button>

      {/* Clear Current Config
      {currentConfigId && (
        <Button
          variant='plain'
          color='neutral'
          onClick={() => dispatch(clearCurrentConfig())}
          size='sm'
        >
          Clear
        </Button>
      )} */}

      {/* Last Saved Info
      {lastSaved && (
        <Typography level='body-sm' color='neutral'>
          Last saved: {formatDate(lastSaved)}
        </Typography>
      )} */}

      {/* Error Display */}
      {error && (
        <Alert color='danger' variant='soft' sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}

      {/* Loading Indicator */}
      {isLoading && <CircularProgress size='sm' />}

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>
          {isNewConfig ? 'Save New Configuration' : 'Save Configuration'}
        </DialogTitle>
        <DialogContent>
          <FormControl>
            <FormLabel>Configuration Name</FormLabel>
            <Input
              autoFocus
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder='Enter configuration name...'
              sx={{ mt: 1 }}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveConfig}
            disabled={!configName.trim() || isLoading}
          >
            {isNewConfig ? 'Save New' : 'Save Overwrite'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Config List Dialog */}
      <Dialog
        open={loadDialogOpen}
        onClose={() => setLoadDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Available Configurations</DialogTitle>
        <DialogContent>
          <List>
            {availableConfigs.map((config) => (
              <ListItem key={config.id}>
                <ListItemText
                  primary={config.name}
                  secondary={`Created: ${formatDate(config.createdAt)} • Modified: ${formatDate(config.lastModified)}`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge='end'
                    onClick={(e) => handleMenuOpen(e, config.id)}
                  >
                    <MoreVert />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoadDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleLoadConfig(selectedConfigId);
            handleMenuClose();
          }}
        >
          <Edit sx={{ mr: 1 }} />
          Load
        </MenuItem>
        <MenuItem
          onClick={() => {
            const config = availableConfigs.find(
              (c) => c.id === selectedConfigId,
            );
            if (config) {
              setIsNewConfig(true);
              setConfigName(`${config.name} (Copy)`);
              setSaveDialogOpen(true);
              setLoadDialogOpen(false);
            }
            handleMenuClose();
          }}
        >
          <ContentCopy sx={{ mr: 1 }} />
          Duplicate
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDeleteConfig(selectedConfigId);
            handleMenuClose();
          }}
          sx={{ color: 'danger.500' }}
        >
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
