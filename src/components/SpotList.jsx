import React from 'react';
import { formatTimeLimit } from '../utils/formatting.js';

export default function SpotList({ spots, selectedId, onSelect }) {
  if (!spots.length) return null;

  return (
    <div className="mt-3">
      <div className="fw-semibold small text-muted mb-1 px-1">
        {spots.length} spot{spots.length !== 1 ? 's' : ''} — click to locate on map
      </div>
      <div style={{ maxHeight: '38vh', overflowY: 'auto', borderRadius: '8px', border: '1px solid #dee2e6' }}>
        {spots.map((spot, i) => (
          <div
            key={spot.id}
            onClick={() => onSelect(spot)}
            style={{
              cursor: 'pointer',
              padding: '8px 12px',
              borderBottom: i < spots.length - 1 ? '1px solid #f0f0f0' : 'none',
              background: selectedId === spot.id ? '#fff3e0' : 'white',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{spot.street}</div>
            <div style={{ fontSize: '0.76rem', color: '#6c757d' }}>
              {spot.side} Side · {spot.distance.toFixed(2)} mi away
            </div>
            <div style={{ fontSize: '0.76rem', color: '#495057' }}>
              {formatTimeLimit(spot.timeLimitMin)} · {spot.enforced}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
