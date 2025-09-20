import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useDispatch, useSelector } from 'react-redux';
import { setAppConfig, setLoading, setError } from '../redux/dataSlice';

export const useAppConfig = (appId = '01') => {
  const [config, setConfig] = useState(null);
  const [loading, setLoadingState] = useState(true);
  const [error, setErrorState] = useState(null);
  const dispatch = useDispatch();

  // Get selected config ID from Redux store
  const selectedConfigId = useSelector(
    (state) => state.configSelector.selectedConfigId
  );
  const actualAppId = selectedConfigId || appId;

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoadingState(true);
        setErrorState(null);

        if (!actualAppId || actualAppId === '01') {
          // No config selected or legacy config - show empty state
          setConfig(null);
          dispatch(setAppConfig(null));
          return;
        }

        // Load from configs collection
        const docRef = doc(db, 'configs', actualAppId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const appConfig = docSnap.data();
          setConfig(appConfig);
          dispatch(setAppConfig(appConfig));
        } else {
          throw new Error('Configuration not found');
        }
      } catch (err) {
        console.error('Error loading app config:', err);
        setErrorState(err.message);
        dispatch(setError(err.message));
      } finally {
        setLoadingState(false);
        dispatch(setLoading(false));
      }
    };

    loadConfig();
  }, [actualAppId, dispatch]);

  return { config, loading, error };
};
