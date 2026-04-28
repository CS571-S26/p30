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

export default function MapLegend() {
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
      <div className="d-flex align-items-center gap-2 mb-1">
        <span style={{ ...DOT_STYLE, background: '#2b7fff' }} />
        <span>Your location</span>
      </div>
      <div className="d-flex align-items-center gap-2">
        <span style={{ ...DOT_STYLE, background: '#e53935' }} />
        <span>ADA parking spot</span>
      </div>
    </div>
  );
}
