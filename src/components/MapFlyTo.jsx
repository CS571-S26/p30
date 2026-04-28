import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export default function MapFlyTo({ center, selectedSpot }) {
  const map = useMap();

  useEffect(() => {
    if (center) map.flyTo([center.lat, center.lng], 15, { duration: 0.8 });
  }, [center, map]);

  useEffect(() => {
    if (selectedSpot) map.flyTo([selectedSpot.lat, selectedSpot.lng], 18, { duration: 0.6 });
  }, [selectedSpot, map]);

  return null;
}
