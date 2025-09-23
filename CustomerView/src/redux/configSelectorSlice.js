import { createSlice } from '@reduxjs/toolkit';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const initialState = {
  availableConfigs: [],
  selectedConfigId: null,
  isLoading: false,
  error: null,
};

const configSelectorSlice = createSlice({
  name: 'configSelector',
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
    setSelectedConfigId: (state, action) => {
      state.selectedConfigId = action.payload;
    },
  },
});

// Async thunk to load available configs
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
        createdAt:
          data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        lastModified:
          data.lastModified?.toDate?.()?.toISOString() ||
          new Date().toISOString(),
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

export const {
  setLoading,
  setError,
  setAvailableConfigs,
  setSelectedConfigId,
} = configSelectorSlice.actions;

export default configSelectorSlice.reducer;
