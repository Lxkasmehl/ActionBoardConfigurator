const STORAGE_KEY = 'dataPickerState';

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);

    if (serializedState === null) {
      return undefined;
    }
    const savedData = JSON.parse(serializedState);

    const state = {
      entities: {
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
        matchingEntityObjects: {},
        formData: {},
        entityLogic: {},
        groupedEntityLogic: {},
        selectedProperties: {},
        customFilters: {},
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
    const serializedState = JSON.stringify({
      config: state.entities.config,
      propertyOptions: state.dataPicker.propertyOptions,
      propertiesBySection: state.dataPicker.propertiesBySection,
      matchingEntitiesForAccordions:
        state.dataPicker.matchingEntitiesForAccordions,
      selectedPropertiesInAccordions:
        state.dataPicker.selectedPropertiesInAccordions,
    });

    try {
      localStorage.setItem(STORAGE_KEY, serializedState);
    } catch (quotaError) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, serializedState);
    }
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
};
