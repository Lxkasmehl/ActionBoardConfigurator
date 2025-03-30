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
        selectedEntities:
          Object.keys(savedData.config).reduce(
            (acc, key) => ({
              ...acc,
              [key]: Object.keys(savedData.config[key])[0],
            }),
            {},
          ) || {},
        associationSets: [],
        propertyOptions: {},
        formData: {},
        entityLogic: {},
        groupedEntityLogic: {},
        selectedProperties: {},
        customFilters: {},
        propertiesBySection: {},
        matchingEntityObjects: {},
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
