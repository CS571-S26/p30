import { useState, useCallback } from 'react';

export function useGeolocation() {
  const [status, setStatus] = useState('idle'); // idle | requesting | granted | denied | error
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setError('Geolocation is not supported by this browser.');
      return;
    }
    setStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus('granted');
      },
      err => {
        setStatus('denied');
        setError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setCoords(null);
    setError(null);
  }, []);

  return { status, coords, error, request, reset };
}
