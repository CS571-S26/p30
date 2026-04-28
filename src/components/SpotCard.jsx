import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { formatTimeLimit } from '../utils/formatting.js';

export default function SpotCard({ spot, onRemove }) {
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
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => onRemove(spot.id)}
          aria-label={`Remove ${spot.street} from saved spots`}
        >
          Remove
        </Button>
      </Card.Body>
    </Card>
  );
}
