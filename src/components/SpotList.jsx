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
        {spots.map((spot, i) => {
          const sideLabel = spot.side ? `${spot.side} Side · ` : '';
          const ariaLabel = [
            spot.street,
            spot.side ? `${spot.side} side` : null,
            `${spot.distance.toFixed(2)} miles away`,
            formatTimeLimit(spot.timeLimitMin),
          ].filter(Boolean).join(', ');

          return (
            <div
              key={spot.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(spot)}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSelect(spot)}
              aria-pressed={selectedId === spot.id}
              aria-label={ariaLabel}
              style={{
                cursor: 'pointer',
                padding: '8px 12px',
                borderBottom: i < spots.length - 1 ? '1px solid #f0f0f0' : 'none',
                background: selectedId === spot.id ? '#fff3e0' : 'white',
                transition: 'background 0.15s',
                outline: 'none',
              }}
              onFocus={e => { e.currentTarget.style.boxShadow = 'inset 0 0 0 2px #0d6efd'; }}
              onBlur={e => { e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{spot.street}</div>
              <div style={{ fontSize: '0.76rem', color: '#6c757d' }}>
                {sideLabel}{spot.distance.toFixed(2)} mi away
              </div>
              <div style={{ fontSize: '0.76rem', color: '#495057' }}>
                {formatTimeLimit(spot.timeLimitMin)}
                {spot.restrictionFull
                  ? ` · ${spot.restrictionFull}`
                  : spot.enforced ? ` · ${spot.enforced}` : ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
