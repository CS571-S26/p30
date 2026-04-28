import React from 'react';
import { Badge } from 'react-bootstrap';

const PILL = {
  free:    { bg: '#198754', label: 'Not enforced' },
  fits:    { bg: '#fd7e14', label: 'Within limit'  },
  exceeds: { bg: '#e53935', label: 'Exceeds limit' },
};

export default function VisitSummary({ counts, radiusLabel }) {
  if (!counts || counts.total === 0) return null;

  return (
    <div
      className="d-flex align-items-center flex-wrap gap-2 mb-2"
      aria-live="polite"
      aria-atomic="true"
    >
      <h2 className="mb-0 fs-5">
        {counts.total} ADA Spot{counts.total !== 1 ? 's' : ''} Found
      </h2>
      {radiusLabel && <Badge bg="secondary">{radiusLabel}</Badge>}

      <div className="d-flex gap-2 ms-auto flex-wrap">
        {(['free', 'fits', 'exceeds']).map(status => (
          counts[status] > 0 && (
            <span
              key={status}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: '#f8f9fa',
                border: `1px solid ${PILL[status].bg}`,
                borderRadius: 20,
                padding: '2px 10px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: PILL[status].bg,
              }}
              aria-label={`${counts[status]} spot${counts[status] !== 1 ? 's' : ''} — ${PILL[status].label}`}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: PILL[status].bg,
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              {counts[status]} {PILL[status].label}
            </span>
          )
        ))}
      </div>
    </div>
  );
}
