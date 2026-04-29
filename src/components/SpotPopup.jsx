import React, { useState } from 'react';
import { getSavedSpots, persistSave } from '../utils/storage.js';
import { formatTimeLimit } from '../utils/formatting.js';

export default function SpotPopup({ spot }) {
  const [saved, setSaved] = useState(() => !!getSavedSpots().find(s => s.id === spot.id));

  const directionsUrl =
    `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;

  const isRestriction = spot.source === 'restrictions';

  return (
    <div style={{ minWidth: '180px' }}>
      <strong style={{ fontSize: '0.88rem' }}>{spot.street}</strong>

      {/* Sub-heading: side for ADA, full restriction text for restrictions */}
      <div style={{ fontSize: '0.78rem', color: '#6c757d', marginTop: 2 }}>
        {isRestriction
          ? spot.restrictionFull || spot.restrictionCode || ''
          : [spot.side && `${spot.side} Side`, spot.distance != null && `${spot.distance.toFixed(2)} mi away`]
              .filter(Boolean).join(' · ')
        }
        {isRestriction && spot.distance != null && (
          <span> · {spot.distance.toFixed(2)} mi away</span>
        )}
      </div>

      <hr style={{ margin: '6px 0' }} />

      {/* Time limit */}
      <div style={{ fontSize: '0.8rem' }}>{formatTimeLimit(spot.timeLimitMin)}</div>

      {/* Enforcement / restriction schedule */}
      {!isRestriction && spot.enforced && (
        <div style={{ fontSize: '0.8rem' }}>{spot.enforced}</div>
      )}

      {/* Status or restriction type */}
      <div
        style={{
          fontSize: '0.8rem',
          marginBottom: 6,
          color: (!isRestriction && spot.status === 'In service') ? '#198754' : '#6c757d',
        }}
      >
        {isRestriction
          ? spot.status   // e.g. "2HR", "No Parking"
          : spot.status   // e.g. "In service"
        }
        {isRestriction && spot.rpArea && (
          <span style={{ marginLeft: 6 }}>· RP3 Area {spot.rpArea}</span>
        )}
      </div>

      {/* Segment length for restrictions dataset */}
      {isRestriction && spot.segmentLengthFt && (
        <div style={{ fontSize: '0.75rem', color: '#adb5bd', marginBottom: 6 }}>
          Segment: ~{spot.segmentLengthFt} ft
        </div>
      )}

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
