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

export const {
  setLoading,
  setError,
  setAvailableConfigs,
  setSelectedConfigId,
} = configSelectorSlice.actions;

export default configSelectorSlice.reducer;
