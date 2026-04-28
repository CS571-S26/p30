import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { formatTimeLimit } from '../utils/formatting.js';

export default function SpotCard({ spot, onRemove }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `${spot.street}, ${spot.side} Side — Madison, WI`;
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
        <Card.Title as="h3" className="fs-6">{spot.street}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">{spot.side} Side</Card.Subtitle>
        <p className="small text-muted mb-1">
          {formatTimeLimit(spot.timeLimitMin)} · {spot.enforced}
        </p>
        <p className="small text-muted mb-3">
          {spot.spaceLengthFt} ft space
        </p>
        <div className="d-flex gap-2 flex-wrap">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleCopy}
            aria-label={`Copy address for ${spot.street}`}
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
