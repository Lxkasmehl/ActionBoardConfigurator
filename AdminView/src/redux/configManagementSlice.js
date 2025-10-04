import { createSlice } from '@reduxjs/toolkit';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import {
  cleanDataForFirebase,
  cleanComponentData,
  cleanTableData,
} from '../utils/dataCleaner';

const initialState = {
  availableConfigs: [],
  currentConfigId: null,
  currentConfigName: null,
  isLoading: false,
  error: null,
  lastSaved: null,
};

const configManagementSlice = createSlice({
  name: 'configManagement',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setAvailableConfigs: (state, action) => {
      state.availableConfigs = action.payload;
    },
    setCurrentConfig: (state, action) => {
      const { id, name } = action.payload;
      state.currentConfigId = id;
      state.currentConfigName = name;
    },
    setLastSaved: (state, action) => {
      state.lastSaved = action.payload;
    },
    clearCurrentConfig: (state) => {
      state.currentConfigId = null;
      state.currentConfigName = null;
    },
  },
});

// Async thunks
export const loadAvailableConfigs = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const configsRef = collection(db, 'configs');
    const querySnapshot = await getDocs(configsRef);

    const configs = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'Unnamed Config',
        createdAt: data.createdAt?.toDate?.() || new Date(),
        lastModified: data.lastModified?.toDate?.() || new Date(),
      };
    });

    // Sort by creation date (newest first)
    configs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    dispatch(setAvailableConfigs(configs));
  } catch (error) {
    console.error('Error loading configs:', error);
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const loadConfig = (configId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const configRef = doc(db, 'configs', configId);
    const configSnap = await getDoc(configRef);

    if (configSnap.exists()) {
      const configData = configSnap.data();

      // Load the config data into the UI Builder state
      dispatch({
        type: 'uiBuilder/loadConfigData',
        payload: configData,
      });

      dispatch(
        setCurrentConfig({
          id: configId,
          name: configData.name,
        }),
      );

      return configData;
    } else {
      throw new Error('Config not found');
    }
  } catch (error) {
    console.error('Error loading config:', error);
    dispatch(setError(error.message));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const saveConfig =
  (configName, isNewConfig = false) =>
  async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const state = getState();
      const { uiBuilder, configManagement } = state;

      // Check for duplicate names if creating new config
      if (isNewConfig) {
        const existingConfig = configManagement.availableConfigs.find(
          (config) => config.name.toLowerCase() === configName.toLowerCase(),
        );
        if (existingConfig) {
          throw new Error(
            `A configuration with the name "${configName}" already exists`,
          );
        }
      }

      // Prepare config data and clean it to remove functions and nested arrays
      const configData = cleanDataForFirebase({
        name: configName,
        components: cleanComponentData(uiBuilder.components),
        columnData: cleanTableData(uiBuilder.columnData),
        tableColumns: cleanTableData(uiBuilder.tableColumns),
        componentGroups: uiBuilder.componentGroups,
        tableData: cleanTableData(uiBuilder.tableData),
        visibleColumns: cleanTableData(uiBuilder.visibleColumns),
        tableConfigEntries: cleanTableData(uiBuilder.tableConfigEntries),
        textConfigEntries: cleanTableData(uiBuilder.textConfigEntries),
        lastModified: new Date(),
      });

      let configId;
      if (isNewConfig) {
        // Create new config
        configId = `config_${Date.now()}`;
        configData.createdAt = new Date();
      } else {
        // Update existing config
        configId = configManagement.currentConfigId;
        if (!configId) {
          throw new Error('No current config to update');
        }
      }

      const configRef = doc(db, 'configs', configId);
      await setDoc(configRef, configData);

      // Update current config info
      dispatch(
        setCurrentConfig({
          id: configId,
          name: configName,
        }),
      );

      // Reload available configs to include the new/updated config
      dispatch(loadAvailableConfigs());

      dispatch(setLastSaved(new Date()));

      return { configId, configName };
    } catch (error) {
      console.error('Error saving config:', error);
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const deleteConfig = (configId) => async (dispatch, getState) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const configRef = doc(db, 'configs', configId);
    await deleteDoc(configRef);

    // If we deleted the current config, clear it
    const currentConfigId = getState().configManagement.currentConfigId;
    if (currentConfigId === configId) {
      dispatch(clearCurrentConfig());
    }

    // Reload available configs
    dispatch(loadAvailableConfigs());
  } catch (error) {
    console.error('Error deleting config:', error);
    dispatch(setError(error.message));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const {
  setLoading,
  setError,
  setAvailableConfigs,
  setCurrentConfig,
  setLastSaved,
  clearCurrentConfig,
} = configManagementSlice.actions;

export default configManagementSlice.reducer;
