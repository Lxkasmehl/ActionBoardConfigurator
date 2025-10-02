import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/joy';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { CssVarsProvider } from '@mui/joy/styles';
import store from './redux/store';
import { useAppConfig } from './hooks/useAppConfig';
import ComponentRenderer from './components/ComponentRenderer';
import NoConfigSelected from './components/NoConfigSelected';
import ConfigError from './components/ConfigError';
import ConfigUrlHandler from './components/ConfigUrlHandler';
import { setVisibleColumns } from './redux/uiStateSlice';

function AppContent() {
  const { config, loading, error } = useAppConfig();
  const dispatch = useDispatch();
  const selectedConfigId = useSelector(
    (state) => state.configSelector.selectedConfigId
  );
  const [showConfigSelector, setShowConfigSelector] = useState(false);

  // Get components from config, not from Redux store
  const components = config?.components || [];
  const visibleColumns = config?.visibleColumns || {};
  const columnData = config?.columnData || {};
  const tableColumns = config?.tableColumns || {};
  const componentGroups = config?.componentGroups || {};

  useEffect(() => {
    // Initialize visibleColumns in Redux store
    if (visibleColumns && Object.keys(visibleColumns).length > 0) {
      Object.entries(visibleColumns).forEach(([tableComponentId, columns]) => {
        dispatch(setVisibleColumns({ tableComponentId, columns }));
      });
    }
  }, [visibleColumns, dispatch]);

  const handleFilterChange = (filterValues) => {
    console.log('Filter changed:', filterValues);
    // Handle filter changes here
  };

  const handleButtonClick = (button) => {
    console.log('Button clicked:', button);
    // Handle button clicks here
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography>Loading application configuration...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <>
        <ConfigUrlHandler />
        <ConfigError error={error} configId={selectedConfigId} />
      </>
    );
  }

  // No config selected
  if (!selectedConfigId || !config || components.length === 0) {
    return (
      <>
        <ConfigUrlHandler />
        <NoConfigSelected />
      </>
    );
  }

  return (
    <>
      <ConfigUrlHandler />
      <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 2 }}>
        {components.map((component, index) => (
          <ComponentRenderer
            key={component.id || index}
            component={{
              ...component,
              columnData,
              tableColumns,
              componentGroups,
              tableData: config?.tableData || {},
            }}
            onFilterChange={handleFilterChange}
            onButtonClick={handleButtonClick}
          />
        ))}
      </Box>
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <CssVarsProvider>
        <AppContent />
      </CssVarsProvider>
    </Provider>
  );
}

export default App;
