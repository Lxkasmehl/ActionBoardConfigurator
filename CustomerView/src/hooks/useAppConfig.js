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

        let docRef;
        let appConfig;

        if (actualAppId === '01') {
          // Load from legacy apps collection
          docRef = doc(db, 'apps', actualAppId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            appConfig = docSnap.data();
          } else {
            throw new Error('App configuration not found');
          }
        } else {
          // Load from new configs collection
          docRef = doc(db, 'configs', actualAppId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            appConfig = docSnap.data();
          } else {
            throw new Error('Configuration not found');
          }
        }

        setConfig(appConfig);
        dispatch(setAppConfig(appConfig));
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
