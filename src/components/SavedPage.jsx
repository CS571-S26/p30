import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { getSavedSpots, persistRemove } from '../utils/storage.js';
import SpotCard from './SpotCard.jsx';
import EmptyState from './EmptyState.jsx';

export default function SavedPage() {
  const [savedSpots, setSavedSpots] = useState(getSavedSpots);

  const handleRemove = spotId => {
    persistRemove(spotId);
    setSavedSpots(getSavedSpots());
  };

  return (
    <Container className="py-4">
      <h2 className="mb-1">Saved Parking Spots</h2>
      <p className="text-muted small mb-4">
        {savedSpots.length} saved spot{savedSpots.length !== 1 ? 's' : ''}
      </p>

      {savedSpots.length === 0 ? (
        <EmptyState
          icon="🅿️"
          title="No saved spots yet"
          message="Find ADA parking near you and tap Save on any spot."
        />
      ) : (
        <Row className="g-4">
          {savedSpots.map(spot => (
            <Col md={6} lg={4} key={spot.id}>
              <SpotCard spot={spot} onRemove={handleRemove} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
