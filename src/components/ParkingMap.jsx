import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import MapFlyTo from './MapFlyTo.jsx';
import SpotPopup from './SpotPopup.jsx';
import MapLegend from './MapLegend.jsx';

const MADISON_CENTER = [43.0742, -89.3837];

export default function ParkingMap({ spots, searchCoords, selectedSpot, selectedSpotId }) {
  return (
    <div role="region" aria-label="Madison ADA parking map" style={{ position: 'relative' }}>
      <MapLegend />
    <MapContainer
      center={MADISON_CENTER}
      zoom={13}
      scrollWheelZoom
      style={{ height: '68vh', minHeight: '520px', width: '100%', borderRadius: '8px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapFlyTo center={searchCoords} selectedSpot={selectedSpot} />
      {searchCoords && (
        <CircleMarker
          center={[searchCoords.lat, searchCoords.lng]}
          radius={9}
          pathOptions={{ color: 'white', fillColor: '#2b7fff', fillOpacity: 0.9, weight: 2 }}
        />
      )}
      {spots.map(spot => {
        const isSelected = spot.id === selectedSpotId;
        return (
          <CircleMarker
            key={spot.id}
            center={[spot.lat, spot.lng]}
            radius={isSelected ? 12 : 9}
            pathOptions={isSelected
              ? { color: 'white', fillColor: '#ff6d00', fillOpacity: 1, weight: 2.5 }
              : { color: 'white', fillColor: '#e53935', fillOpacity: 1, weight: 2 }
            }
          >
            <Popup>
              <SpotPopup spot={spot} />
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
    </div>
  );
}
