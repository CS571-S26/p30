import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import MapFlyTo from './MapFlyTo.jsx';
import MapLegend from './MapLegend.jsx';
import SpotPopup from './SpotPopup.jsx';

const MADISON_CENTER = [43.0742, -89.3837];

const STATUS_COLORS = {
  free:    '#198754',
  fits:    '#fd7e14',
  exceeds: '#e53935',
};

const VISIT_LEGEND = [
  { color: '#2b7fff', label: 'Your location' },
  { color: '#198754', label: 'Not enforced — park free' },
  { color: '#fd7e14', label: 'Enforced — fits your stay' },
  { color: '#e53935', label: 'Enforced — exceeds limit' },
];

export default function VisitMap({ spots, statusMap, searchCoords, selectedSpot, selectedSpotId }) {
  return (
    <div role="region" aria-label="Madison ADA parking visit map" style={{ position: 'relative' }}>
      <MapLegend items={VISIT_LEGEND} />
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

        {/* Your location dot */}
        {searchCoords && (
          <CircleMarker
            center={[searchCoords.lat, searchCoords.lng]}
            radius={9}
            pathOptions={{ color: 'white', fillColor: '#2b7fff', fillOpacity: 0.9, weight: 2 }}
          />
        )}

        {/* Parking spots colored by visit status */}
        {spots.map(spot => {
          const status = statusMap[spot.id] ?? 'fits';
          const fill = STATUS_COLORS[status] ?? '#9e9e9e';
          const isSelected = spot.id === selectedSpotId;
          return (
            <CircleMarker
              key={spot.id}
              center={[spot.lat, spot.lng]}
              radius={isSelected ? 12 : 9}
              pathOptions={{
                color: 'white',
                fillColor: fill,
                fillOpacity: 1,
                weight: isSelected ? 2.5 : 2,
              }}
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
