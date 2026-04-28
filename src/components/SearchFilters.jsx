import React from 'react';
import { Card, Form, InputGroup, Button, Spinner } from 'react-bootstrap';
import { RADIUS_OPTIONS } from '../constants.js';

export default function SearchFilters({
  locationMode, onLocationModeChange,
  radius, onRadiusChange,
  geoStatus, geoError, coords,
  onRequestLocation,
  address, onAddressChange,
  onSearch,
  geocodeStatus,
  geocodeError,
  weekendOnly, onWeekendChange,
  freeOnly, onFreeChange,
}) {
  const handleSearch = () => {
    const trimmed = address.trim();
    if (trimmed) onSearch(trimmed);
  };

  return (
    <Card className="p-3 shadow-sm border-0">
      <h2 className="mb-3 fw-bold text-dark fs-5">Find ADA Parking</h2>

      <div
        className="sliding-toggle-wrapper mb-4"
        role="group"
        aria-label="Location input mode"
      >
        <div className={`selection-pill${locationMode === 'current' ? ' is-right' : ''}`} aria-hidden="true" />
        <button
          type="button"
          className="toggle-option"
          onClick={() => onLocationModeChange('manual')}
          aria-pressed={locationMode === 'manual'}
        >
          <span style={{ color: locationMode !== 'current' ? 'white' : '#6c757d' }}>Manual</span>
        </button>
        <button
          type="button"
          className="toggle-option"
          onClick={() => onLocationModeChange('current')}
          aria-pressed={locationMode === 'current'}
        >
          <span style={{ color: locationMode === 'current' ? 'white' : '#6c757d' }}>Current</span>
        </button>
      </div>

      <Form>
        {locationMode === 'manual' && (
          <Form.Group className="mb-3">
            <Form.Label className="small fw-semibold">Street Address</Form.Label>
            <InputGroup>
              <Form.Control
                value={address}
                onChange={e => onAddressChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. 716 Langdon St"
                className="border-end-0"
                disabled={geocodeStatus === 'loading'}
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
              ? <div className="text-danger small mt-1">{geocodeError}</div>
              : <Form.Text className="text-muted">Enter an address or intersection.</Form.Text>
            }
          </Form.Group>
        )}

        {locationMode === 'current' && (
          <div className="mb-3">
            {geoStatus === 'idle' && (
              <Button
                variant="outline-primary"
                className="w-100"
                onClick={e => { e.stopPropagation(); onRequestLocation(); }}
              >
                Enable GPS Location
              </Button>
            )}
            {geoStatus === 'requesting' && (
              <div className="py-2 text-center text-primary small fw-medium">
                <Spinner animation="border" size="sm" className="me-1" />
                Locating…
              </div>
            )}
            {geoStatus === 'granted' && coords && (
              <div className="py-2 text-center text-success small fw-medium">
                GPS Active · {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </div>
            )}
            {(geoStatus === 'denied' || geoStatus === 'error') && (
              <div>
                <div className="text-danger small mb-2">{geoError || 'Location unavailable.'}</div>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={e => { e.stopPropagation(); onRequestLocation(); }}
                >
                  Retry
                </Button>
              </div>
            )}
          </div>
        )}

        <Form.Group className="mb-3">
          <Form.Label className="small fw-semibold">Parking Radius</Form.Label>
          <Form.Select value={radius} onChange={e => onRadiusChange(e.target.value)}>
            {RADIUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            label="Weekend Parking"
            className="small"
            checked={weekendOnly}
            onChange={e => onWeekendChange(e.target.checked)}
          />
          <Form.Check
            type="checkbox"
            label="Free Spots Only"
            className="small"
            checked={freeOnly}
            onChange={e => onFreeChange(e.target.checked)}
          />
        </Form.Group>
      </Form>
    </Card>
  );
}
