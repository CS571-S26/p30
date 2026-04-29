import React, { useState } from 'react';
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
  searchHistory,
}) {
  const [showHistory, setShowHistory] = useState(false);

  const handleSearch = () => {
    const trimmed = address.trim();
    if (trimmed) {
      setShowHistory(false);
      onSearch(trimmed);
    }
  };

  const handleHistorySelect = entry => {
    onAddressChange(entry);
    onSearch(entry);
    setShowHistory(false);
  };

  const historyVisible = showHistory && searchHistory && searchHistory.length > 0;
  // this is a new comment

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

            {/* Wrapper gives the dropdown a positioned anchor */}
            <div style={{ position: 'relative' }}>
              <InputGroup>
                <Form.Control
                  value={address}
                  onChange={e => onAddressChange(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  onFocus={() => setShowHistory(true)}
                  onBlur={() => setTimeout(() => setShowHistory(false), 150)}
                  placeholder="e.g. 716 Langdon St"
                  className="border-end-0"
                  disabled={geocodeStatus === 'loading'}
                  aria-autocomplete="list"
                  aria-controls={historyVisible ? 'search-history-list' : undefined}
                  aria-expanded={historyVisible}
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

              {historyVisible && (
                <div
                  id="search-history-list"
                  role="listbox"
                  aria-label="Recent searches"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 1050,
                    background: 'white',
                    border: '1px solid #dee2e6',
                    borderTop: 'none',
                    borderRadius: '0 0 6px 6px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
                  }}
                >
                  <div style={{
                    padding: '4px 12px 3px',
                    fontSize: '0.7rem',
                    color: '#6c757d',
                    borderBottom: '1px solid #f0f0f0',
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase',
                  }}>
                    Recent
                  </div>
                  {searchHistory.map((entry, i) => (
                    <div
                      key={i}
                      role="option"
                      aria-selected="false"
                      tabIndex={0}
                      onMouseDown={e => { e.preventDefault(); handleHistorySelect(entry); }}
                      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleHistorySelect(entry)}
                      onMouseEnter={e => { e.currentTarget.style.background = '#f8f9fa'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
                      style={{
                        padding: '7px 12px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        borderBottom: i < searchHistory.length - 1 ? '1px solid #f0f0f0' : 'none',
                      }}
                    >
                      <span aria-hidden="true" style={{ color: '#adb5bd', fontSize: '0.8rem' }}>⟳</span>
                      {entry}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {geocodeError
              ? <div className="text-danger small mt-1" role="alert">{geocodeError}</div>
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
                <div className="text-danger small mb-2" role="alert">{geoError || 'Location unavailable.'}</div>
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
