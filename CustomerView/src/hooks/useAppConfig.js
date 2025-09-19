import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useDispatch } from 'react-redux';
import { setAppConfig, setLoading, setError } from '../redux/dataSlice';

export const useAppConfig = (appId = '01') => {
  const [config, setConfig] = useState(null);
  const [loading, setLoadingState] = useState(true);
  const [error, setErrorState] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoadingState(true);
        setErrorState(null);

        const docRef = doc(db, 'apps', appId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const appConfig = docSnap.data();
          setConfig(appConfig);
          dispatch(setAppConfig(appConfig));
        } else {
          throw new Error('App configuration not found');
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
  }, [appId, dispatch]);

  return { config, loading, error };
};
