import React from 'react';
import { Badge } from 'react-bootstrap';

export default function ResultsHeader({ count, radiusLabel, emptyHint }) {
  return (
    <div
      className="d-flex align-items-center flex-wrap gap-2 mb-2"
      aria-live="polite"
      aria-atomic="true"
    >
      <h2 className="mb-0 fs-5">
        {count} ADA Spot{count !== 1 ? 's' : ''} Found
      </h2>
      <Badge bg="secondary">{radiusLabel}</Badge>
      {count === 0 && emptyHint && (
        <span className="text-muted small">{emptyHint}</span>
      )}
    </div>
  );
}
