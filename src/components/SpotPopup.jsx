import React, { useState } from 'react';
import { getSavedSpots, persistSave } from '../utils/storage.js';
import { formatTimeLimit } from '../utils/formatting.js';

export default function SpotPopup({ spot }) {
  const [saved, setSaved] = useState(() => !!getSavedSpots().find(s => s.id === spot.id));

  const directionsUrl =
    `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;

  return (
    <div style={{ minWidth: '170px' }}>
      <strong style={{ fontSize: '0.88rem' }}>{spot.street}</strong>
      <div style={{ fontSize: '0.78rem', color: '#6c757d', marginTop: 2 }}>
        {spot.side} Side
        {spot.distance != null ? ` · ${spot.distance.toFixed(2)} mi away` : ''}
      </div>
      <hr style={{ margin: '6px 0' }} />
      <div style={{ fontSize: '0.8rem' }}>{formatTimeLimit(spot.timeLimitMin)}</div>
      <div style={{ fontSize: '0.8rem' }}>{spot.enforced}</div>
      <div style={{ fontSize: '0.8rem', marginBottom: 6, color: spot.status === 'In service' ? '#198754' : '#6c757d' }}>
        {spot.status}
      </div>
      <button
        className={`btn btn-sm ${saved ? 'btn-success' : 'btn-primary'} w-100`}
        style={{ fontSize: '0.78rem' }}
        onClick={() => { persistSave(spot); setSaved(true); }}
        disabled={saved}
      >
        {saved ? 'Saved ✓' : 'Save Spot'}
      </button>
      <a
        href={directionsUrl}
        target="_blank"
        rel="noreferrer"
        className="btn btn-sm btn-outline-secondary w-100 mt-1"
        style={{ fontSize: '0.78rem' }}
        aria-label={`Get directions to ${spot.street} in Google Maps`}
      >
        Get Directions ↗
      </a>
    </div>
  );
}
