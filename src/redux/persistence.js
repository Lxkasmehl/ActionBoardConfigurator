const STORAGE_KEY = 'dataPickerState';

const getLocalStorage = () => {
  // If we're in an iframe, use the parent window's localStorage
  if (window.parent !== window) {
    try {
      return window.parent.localStorage;
    } catch (e) {
      console.warn('Could not access parent localStorage:', e);
      return localStorage;
    }
  }
  return localStorage;
};

export const loadState = () => {
  try {
    const storage = getLocalStorage();
    const serializedState = storage.getItem(STORAGE_KEY);

    if (serializedState === null) {
      return undefined;
    }
    const savedData = JSON.parse(serializedState);

    const state = {
      config: {
        config: savedData.config || {},
      },
      dataPicker: {
        selectedEntities:
          Object.keys(savedData.config).reduce(
            (acc, key) => ({
              ...acc,
              [key]: Object.keys(savedData.config[key])[0],
            }),
            {},
          ) || {},
        propertiesBySection: savedData.propertiesBySection || {},
        matchingEntitiesForAccordions:
          savedData.matchingEntitiesForAccordions || {},
        selectedPropertiesInAccordions:
          savedData.selectedPropertiesInAccordions || {},
        propertyOptions: savedData.propertyOptions || {},
        conditionsForFilterModal: savedData.conditionsForFilterModal || {},
        formData: savedData.formData || {},
        edgesForFlow: savedData.edgesForFlow || [],
        matchingEntityObjects: {},
        entityLogic: {},
        groupedEntityLogic: {},
        selectedProperties: {},
        filterStorageForNodesNotConnectedToEdges: {},
      },
      fetchedData: {
        associationSets: [],
      },
    };

    return state;
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return undefined;
  }
};

export const saveState = (state) => {
  try {
    const storage = getLocalStorage();
    const serializedState = JSON.stringify({
      config: state.config.config,
      propertyOptions: state.dataPicker.propertyOptions,
      propertiesBySection: state.dataPicker.propertiesBySection,
      matchingEntitiesForAccordions:
        state.dataPicker.matchingEntitiesForAccordions,
      selectedPropertiesInAccordions:
        state.dataPicker.selectedPropertiesInAccordions,
      conditionsForFilterModal: state.dataPicker.conditionsForFilterModal,
      formData: state.dataPicker.formData,
      edgesForFlow: state.dataPicker.edgesForFlow,
    });

    try {
      storage.setItem(STORAGE_KEY, serializedState);

      // If we're in an iframe, also notify the parent window
      if (window.parent !== window) {
        window.parent.postMessage(
          {
            type: 'DATAPICKER_STATE_SAVED',
            payload: serializedState,
          },
          window.location.origin,
        );
      }
    } catch (quotaError) {
      storage.removeItem(STORAGE_KEY);
      storage.setItem(STORAGE_KEY, serializedState);
    }
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
};
