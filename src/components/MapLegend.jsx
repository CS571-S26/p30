import React from 'react';

const DOT_STYLE = {
  width: 11,
  height: 11,
  borderRadius: '50%',
  display: 'inline-block',
  border: '2px solid white',
  boxShadow: '0 0 0 1px #bbb',
  flexShrink: 0,
};

const DEFAULT_ITEMS = [
  { color: '#2b7fff', label: 'Your location' },
  { color: '#e53935', label: 'ADA parking spot' },
];

export default function MapLegend({ items }) {
  const rows = items ?? DEFAULT_ITEMS;
  return (
    <div
      aria-label="Map legend"
      role="note"
      style={{
        position: 'absolute',
        bottom: 30,
        right: 10,
        zIndex: 9999,
        background: 'white',
        borderRadius: 6,
        padding: '6px 10px',
        boxShadow: '0 1px 5px rgba(0,0,0,0.25)',
        fontSize: '0.73rem',
        lineHeight: 1.5,
        pointerEvents: 'none',
      }}
    >
      {rows.map(({ color, label }, i) => (
        <div
          key={label}
          className={`d-flex align-items-center gap-2${i < rows.length - 1 ? ' mb-1' : ''}`}
        >
          <span style={{ ...DOT_STYLE, background: color }} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
