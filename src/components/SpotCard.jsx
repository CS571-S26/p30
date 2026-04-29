import React, { useState } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { formatTimeLimit } from '../utils/formatting.js';

export default function SpotCard({ spot, onRemove }) {
  const [copied, setCopied] = useState(false);

  const isRestriction = spot.source === 'restrictions';

  const handleCopy = async () => {
    const text = isRestriction
      ? `${spot.street} — ${spot.restrictionFull || spot.enforced} — Madison, WI`
      : `${spot.street}${spot.side ? `, ${spot.side} Side` : ''} — Madison, WI`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable (non-HTTPS or denied)
    }
  };

  return (
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <div className="d-flex align-items-start justify-content-between gap-2 mb-1">
          <Card.Title as="h3" className="fs-6 mb-0">{spot.street}</Card.Title>
          {isRestriction && (
            <Badge bg="secondary" style={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
              Street Restriction
            </Badge>
          )}
        </div>

        {/* Sub-title: side for ADA, restriction code for restrictions */}
        <Card.Subtitle className="mb-2 text-muted">
          {isRestriction
            ? (spot.restrictionFull || spot.restrictionCode || '')
            : spot.side
              ? `${spot.side} Side`
              : null
          }
        </Card.Subtitle>

        <p className="small text-muted mb-1">
          {formatTimeLimit(spot.timeLimitMin)}
          {!isRestriction && spot.enforced ? ` · ${spot.enforced}` : ''}
        </p>

        {/* ADA: space length | Restrictions: segment length */}
        <p className="small text-muted mb-3">
          {isRestriction
            ? spot.segmentLengthFt ? `~${spot.segmentLengthFt} ft segment` : null
            : spot.spaceLengthFt ? `${spot.spaceLengthFt} ft space` : null
          }
        </p>

        <div className="d-flex gap-2 flex-wrap">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleCopy}
            aria-label={`Copy details for ${spot.street}`}
          >
            {copied ? 'Copied ✓' : 'Copy Address'}
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => onRemove(spot.id)}
            aria-label={`Remove ${spot.street} from saved spots`}
          >
            Remove
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
