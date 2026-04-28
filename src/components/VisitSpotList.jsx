import React from 'react';
import { formatTimeLimit } from '../utils/formatting.js';

const STATUS_META = {
  free:    { color: '#198754', label: 'Free',         rowBg: '#f0fdf4' },
  fits:    { color: '#fd7e14', label: 'Within Limit', rowBg: '#fff8f0' },
  exceeds: { color: '#e53935', label: 'Over Limit',   rowBg: '#fff5f5' },
};

// Sort: free → fits → exceeds, then by distance within each group
const SORT_ORDER = { free: 0, fits: 1, exceeds: 2 };

export default function VisitSpotList({ spots, statusMap, selectedId, onSelect }) {
  if (!spots.length) return null;

  const sorted = [...spots].sort((a, b) => {
    const sa = SORT_ORDER[statusMap[a.id]] ?? 2;
    const sb = SORT_ORDER[statusMap[b.id]] ?? 2;
    return sa !== sb ? sa - sb : a.distance - b.distance;
  });

  return (
    <div className="mt-3">
      <div className="fw-semibold small text-muted mb-1 px-1">
        {spots.length} spot{spots.length !== 1 ? 's' : ''} — click to locate on map
      </div>
      <div style={{ maxHeight: '38vh', overflowY: 'auto', borderRadius: '8px', border: '1px solid #dee2e6' }}>
        {sorted.map((spot, i) => {
          const status = statusMap[spot.id] ?? 'fits';
          const meta = STATUS_META[status];
          const isSelected = spot.id === selectedId;
          return (
            <div
              key={spot.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(spot)}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSelect(spot)}
              aria-pressed={isSelected}
              aria-label={`${spot.street}, ${spot.side} side, ${spot.distance.toFixed(2)} miles away, ${formatTimeLimit(spot.timeLimitMin)}, status: ${meta.label}`}
              style={{
                cursor: 'pointer',
                padding: '8px 12px',
                borderBottom: i < sorted.length - 1 ? '1px solid #f0f0f0' : 'none',
                background: isSelected ? '#e8f4fd' : meta.rowBg,
                transition: 'background 0.15s',
                outline: 'none',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}
              onFocus={e => { e.currentTarget.style.boxShadow = 'inset 0 0 0 2px #0d6efd'; }}
              onBlur={e => { e.currentTarget.style.boxShadow = 'none'; }}
            >
              {/* Status dot */}
              <span
                aria-hidden="true"
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: meta.color,
                  flexShrink: 0,
                  marginTop: 4,
                  border: '2px solid white',
                  boxShadow: `0 0 0 1px ${meta.color}`,
                }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {spot.street}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#6c757d' }}>
                  {spot.side} Side · {spot.distance.toFixed(2)} mi
                </div>
                <div style={{ fontSize: '0.76rem', color: meta.color, fontWeight: 500 }}>
                  {meta.label} · {formatTimeLimit(spot.timeLimitMin)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
