import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { getSavedSpots, persistRemove } from '../utils/storage.js';
import { formatTimeLimit } from '../utils/formatting.js';

export default function SavedPage() {
  const [savedSpots, setSavedSpots] = useState(getSavedSpots);

  const handleRemove = spotId => {
    persistRemove(spotId);
    setSavedSpots(getSavedSpots());
  };

  return (
    <Container className="py-4">
      <h2 className="mb-3">Saved Parking Spots</h2>
      {savedSpots.length === 0 ? (
        <p className="text-muted">
          No saved spots yet. Find ADA parking near you and tap Save.
        </p>
      ) : (
        <Row className="g-4 mt-1">
          {savedSpots.map(spot => (
            <Col md={6} lg={4} key={spot.id}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>{spot.street}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">{spot.side} Side</Card.Subtitle>
                  <p className="small text-muted mb-1">
                    {formatTimeLimit(spot.timeLimitMin)} · {spot.enforced}
                  </p>
                  <p className="small text-muted mb-3">
                    {spot.spaceLengthFt} ft space
                  </p>
                  <Button variant="outline-danger" size="sm" onClick={() => handleRemove(spot.id)}>
                    Remove
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
