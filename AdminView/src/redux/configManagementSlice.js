import { createSlice } from '@reduxjs/toolkit';
import { db } from '../../firebase';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  query,
  orderBy,
} from 'firebase/firestore';

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
    const q = query(configsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const configs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      lastModified: doc.data().lastModified?.toDate?.() || new Date(),
    }));

    dispatch(setAvailableConfigs(configs));
  } catch (error) {
    console.error('Error loading configs:', error);
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const loadConfig = (configId) => async (dispatch, getState) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const configRef = doc(db, 'configs', configId);
    const configSnap = await getDoc(configRef);

    if (configSnap.exists()) {
      const configData = configSnap.data();

      // Load the config data into the UI Builder state
      const { uiBuilder } = getState();
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
      const { uiBuilder } = state;

      // Prepare config data
      const configData = {
        name: configName,
        components: uiBuilder.components,
        columnData: uiBuilder.columnData,
        tableColumns: uiBuilder.tableColumns,
        componentGroups: uiBuilder.componentGroups,
        tableData: uiBuilder.tableData,
        visibleColumns: uiBuilder.visibleColumns,
        tableConfigEntries: uiBuilder.tableConfigEntries,
        textConfigEntries: uiBuilder.textConfigEntries,
        lastModified: new Date(),
      };

      let configId;
      if (isNewConfig) {
        // Create new config
        configId = `config_${Date.now()}`;
        configData.createdAt = new Date();
      } else {
        // Update existing config
        configId = state.configManagement.currentConfigId;
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
