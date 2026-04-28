import { useState, useEffect } from 'react';
import { getSavedSpots } from '../utils/storage.js';

export function useSavedCount() {
  const [count, setCount] = useState(() => getSavedSpots().length);

  useEffect(() => {
    const handler = () => setCount(getSavedSpots().length);
    window.addEventListener('pw:saved-change', handler);
    return () => window.removeEventListener('pw:saved-change', handler);
  }, []);

  return count;
}
