import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedConfigId } from '../redux/configSelectorSlice';
import {
  getConfigIdFromUrl,
  cleanInvalidConfigFromUrl,
} from '../utils/configUrl';

export default function ConfigUrlHandler() {
  const dispatch = useDispatch();
  const selectedConfigId = useSelector(
    (state) => state.configSelector.selectedConfigId
  );

  useEffect(() => {
    // Clean invalid config IDs from URL first
    cleanInvalidConfigFromUrl();

    const configId = getConfigIdFromUrl();

    if (configId && configId !== selectedConfigId) {
      dispatch(setSelectedConfigId(configId));
    } else if (!configId && selectedConfigId) {
      // If no config in URL but we have one selected, clear it
      dispatch(setSelectedConfigId(null));
    }
  }, [dispatch, selectedConfigId]);

  // Listen for URL changes (back/forward navigation)
  useEffect(() => {
    const handleUrlChange = () => {
      const configId = getConfigIdFromUrl();
      dispatch(setSelectedConfigId(configId));
    };

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [dispatch]);

  return null; // This component doesn't render anything
}
