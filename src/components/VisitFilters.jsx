import React from 'react';
import { Card, Form, InputGroup, Button, Row, Col, Spinner } from 'react-bootstrap';
import { RADIUS_OPTIONS } from '../constants.js';

const STAY_OPTIONS = [
  { label: 'Not sure',   value: '' },
  { label: '30 minutes', value: '30' },
  { label: '1 hour',     value: '60' },
  { label: '1.5 hours',  value: '90' },
  { label: '2 hours',    value: '120' },
  { label: '3 hours',    value: '180' },
  { label: '3+ hours',   value: '240' },
];

export default function VisitFilters({
  address, onAddressChange,
  onSearch,
  geocodeStatus, geocodeError,
  visitDate, onVisitDateChange,
  arrivalTime, onArrivalTimeChange,
  stayMinutes, onStayChange,
  radius, onRadiusChange,
}) {
  const handleSearch = () => {
    const trimmed = address.trim();
    if (trimmed) onSearch(trimmed);
  };

  return (
    <Card className="p-3 shadow-sm border-0">
      <h2 className="mb-1 fw-bold text-dark fs-5">Plan a Visit</h2>
      <p className="text-muted small mb-3">
        See which spots are actually available for your specific arrival time and stay.
      </p>

      <Form>
        {/* Address */}
        <Form.Group className="mb-3">
          <Form.Label className="small fw-semibold">Destination Address</Form.Label>
          <InputGroup>
            <Form.Control
              value={address}
              onChange={e => onAddressChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. 716 Langdon St"
              className="border-end-0"
              disabled={geocodeStatus === 'loading'}
              aria-label="Destination address"
            />
            <Button
              variant="outline-secondary"
              className="border-start-0"
              style={{ borderColor: '#dee2e6' }}
              onClick={handleSearch}
              disabled={!address.trim() || geocodeStatus === 'loading'}
            >
              {geocodeStatus === 'loading'
                ? <Spinner animation="border" size="sm" />
                : 'Find'}
            </Button>
          </InputGroup>
          {geocodeError
            ? <div className="text-danger small mt-1" role="alert">{geocodeError}</div>
            : <Form.Text className="text-muted">Enter the address you're visiting.</Form.Text>
          }
        </Form.Group>

        {/* Date + Arrival Time side by side */}
        <Row className="g-2 mb-3">
          <Col xs={6}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Date</Form.Label>
              <Form.Control
                type="date"
                value={visitDate}
                onChange={e => onVisitDateChange(e.target.value)}
                aria-label="Visit date"
              />
            </Form.Group>
          </Col>
          <Col xs={6}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Arrival Time</Form.Label>
              <Form.Control
                type="time"
                value={arrivalTime}
                onChange={e => onArrivalTimeChange(e.target.value)}
                aria-label="Arrival time"
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Stay duration */}
        <Form.Group className="mb-3">
          <Form.Label className="small fw-semibold">How Long Will You Stay?</Form.Label>
          <Form.Select
            value={stayMinutes === null ? '' : String(stayMinutes)}
            onChange={e => onStayChange(e.target.value === '' ? null : parseInt(e.target.value))}
            aria-label="Planned stay duration"
          >
            {STAY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Form.Select>
          <Form.Text className="text-muted">
            All ADA spots here have a 3-hour limit when enforced.
          </Form.Text>
        </Form.Group>

        {/* Radius */}
        <Form.Group className="mb-1">
          <Form.Label className="small fw-semibold">Search Radius</Form.Label>
          <Form.Select
            value={radius}
            onChange={e => onRadiusChange(e.target.value)}
            aria-label="Parking search radius"
          >
            {RADIUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Form.Select>
        </Form.Group>
      </Form>
    </Card>
  );
}
