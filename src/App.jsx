import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  Navbar, Nav, Container, Row, Col,
  Card, Button, Form, InputGroup,
  Alert, Spinner, Badge,
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { loadParkingSpots, findNearbySpots, findTopNSpots, geocodeAddress } from './utils/parkingData.js';
import { RADIUS_MILES } from './utils/geo.js';

const RADIUS_OPTIONS = [
  { label: 'Within 2 blocks',   value: '2' },
  { label: 'Within 5 blocks',   value: '5' },
  { label: 'Within 10 blocks',  value: '10' },
  { label: 'Nearest 10 spots',  value: 'nearest' },
];

// Returns spots that pass the active checkbox filters.
// weekend: hide spots enforced weekdays-only (keep 24hr & weekend spots).
// freeOnly: hide metered/paid spots.
function applyFilters(spots, weekend, freeOnly) {
  let result = spots;
  if (weekend) {
    result = result.filter(s => !/mon|tue|wed|thu|fri|weekday/i.test(s.enforced));
  }
  if (freeOnly) {
    result = result.filter(s => !/meter|pay|paid|fee|charge/i.test(s.restriction));
  }
  return result;
}

// ── useGeolocation ────────────────────────────────────────────────────────────

function useGeolocation() {
  const [status, setStatus] = useState('idle'); // idle | requesting | granted | denied | error
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setError('Geolocation is not supported by this browser.');
      return;
    }
    setStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus('granted');
      },
      err => {
        setStatus('denied');
        setError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setCoords(null);
    setError(null);
  }, []);

  return { status, coords, error, request, reset };
}

// ── localStorage helpers ──────────────────────────────────────────────────────

function getSavedSpots() {
  try {
    return JSON.parse(localStorage.getItem('savedParkingSpots') || '[]');
  } catch {
    return [];
  }
}

function persistSave(spot) {
  const current = getSavedSpots();
  if (current.find(s => s.id === spot.id)) return;
  localStorage.setItem('savedParkingSpots', JSON.stringify([...current, spot]));
}

function persistRemove(spotId) {
  const updated = getSavedSpots().filter(s => s.id !== spotId);
  localStorage.setItem('savedParkingSpots', JSON.stringify(updated));
}

// ── PrimaryNav ────────────────────────────────────────────────────────────────

const PrimaryNav = () => (
  <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
    <Container>
      <Navbar.Brand as={Link} to="/">Madison ParkWise</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/">Finder</Nav.Link>
          <Nav.Link as={Link} to="/saved">Saved</Nav.Link>
          <Nav.Link as={Link} to="/about">About</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
);

// ── SearchFilters ─────────────────────────────────────────────────────────────

const SearchFilters = ({
  locationMode, onLocationModeChange,
  radius, onRadiusChange,
  geoStatus, geoError, coords,
  onRequestLocation,
  onSearch,         // (address: string) => void
  geocodeStatus,    // 'idle' | 'loading' | 'error'
  geocodeError,     // string | null
  weekendOnly, onWeekendChange,
  freeOnly, onFreeChange,
}) => {
  const [address, setAddress] = useState('');

  const handleSearch = () => {
    const trimmed = address.trim();
    if (trimmed) onSearch(trimmed);
  };

  return (
    <Card className="p-3 shadow-sm border-0">
      <h5 className="mb-3 fw-bold text-dark">Find ADA Parking</h5>

      <div
        className="sliding-toggle-wrapper mb-4"
        onClick={() => onLocationModeChange(locationMode === 'manual' ? 'current' : 'manual')}
      >
        <div className={`selection-pill${locationMode === 'current' ? ' is-right' : ''}`} />
        <div className="toggle-option">
          <span style={{ color: locationMode !== 'current' ? 'white' : '#6c757d' }}>Manual</span>
        </div>
        <div className="toggle-option">
          <span style={{ color: locationMode === 'current' ? 'white' : '#6c757d' }}>Current</span>
        </div>
      </div>

      <Form>
        {locationMode === 'manual' && (
          <Form.Group className="mb-3">
            <Form.Label className="small fw-semibold">Street Address</Form.Label>
            <InputGroup>
              <Form.Control
                value={address}
                onChange={e => setAddress(e.target.value)}
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
};

// ── ParkingSpot ───────────────────────────────────────────────────────────────

const ParkingSpot = ({ spot }) => {
  const [showModal, setShowModal] = useState(false);
  const [saved, setSaved] = useState(() => !!getSavedSpots().find(s => s.id === spot.id));

  const handleSave = () => {
    persistSave(spot);
    setSaved(true);
  };

  const formatLimit = () => {
    const hrs = parseInt(spot.timeLimitHr);
    const mins = parseInt(spot.timeLimitMin);
    if (hrs > 0 && mins > 0) return `${hrs}hr ${mins}min limit`;
    if (hrs > 0) return `${hrs}-hour limit`;
    if (mins > 0) return `${mins}-minute limit`;
    return 'No limit listed';
  };

  return (
    <>
      <Card className="mb-3">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <Card.Title className="mb-0">{spot.street}</Card.Title>
              <Card.Subtitle className="mb-1 text-muted small">
                {spot.side} Side · {spot.distance.toFixed(2)} mi away
              </Card.Subtitle>
            </div>
            <Badge bg={spot.status === 'In service' ? 'success' : 'secondary'} className="ms-2">
              {spot.status}
            </Badge>
          </div>
          <p className="small text-muted mb-2 mt-1">
            {formatLimit()} · {spot.enforced}
          </p>
          <div className="d-flex gap-2">
            <Button variant="outline-success" size="sm" onClick={() => setShowModal(true)}>
              View Details
            </Button>
            <Button
              variant={saved ? 'success' : 'outline-primary'}
              size="sm"
              onClick={handleSave}
              disabled={saved}
            >
              {saved ? 'Saved ✓' : 'Save'}
            </Button>
          </div>
        </Card.Body>
      </Card>

      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1050,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: '12px',
              padding: '1.5rem', width: '360px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            }}
          >
            <h5 className="fw-bold mb-1">{spot.street}</h5>
            <p className="text-muted small mb-3">{spot.side} Side · ADA On-Street Parking</p>
            <hr />
            <p className="small mb-1"><strong>Block:</strong> {spot.blockNbr}</p>
            <p className="small mb-1"><strong>Enforced:</strong> {spot.enforced}</p>
            <p className="small mb-1"><strong>Time Limit:</strong> {formatLimit()}</p>
            <p className="small mb-1"><strong>Space Length:</strong> {spot.spaceLengthFt} ft</p>
            {spot.restriction && (
              <p className="small mb-1"><strong>Restriction:</strong> {spot.restriction}</p>
            )}
            <p className="small mb-1"><strong>Status:</strong> {spot.status}</p>
            <p className="small mb-3"><strong>Distance:</strong> {spot.distance.toFixed(3)} mi</p>
            <div className="d-flex gap-2">
              <Button
                variant={saved ? 'success' : 'primary'}
                className="flex-grow-1"
                onClick={() => { if (!saved) handleSave(); setShowModal(false); }}
              >
                {saved ? 'Saved ✓' : 'Save Spot'}
              </Button>
              <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ── FinderPage ────────────────────────────────────────────────────────────────

const FinderPage = () => {
  const geo = useGeolocation();
  const [locationMode, setLocationMode] = useState('manual');
  const [radius, setRadius] = useState('2');
  const [allSpots, setAllSpots] = useState([]);
  const [nearbySpots, setNearbySpots] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [dataError, setDataError] = useState(null);

  // Unified search origin — set by either GPS or address geocoding
  const [searchCoords, setSearchCoords] = useState(null);
  const [searchLabel, setSearchLabel] = useState(null);

  // Manual geocode status
  const [geocodeStatus, setGeocodeStatus] = useState('idle'); // idle | loading | error
  const [geocodeError, setGeocodeError] = useState(null);

  // Checkbox filters
  const [weekendOnly, setWeekendOnly] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);

  // Load CSV once on mount
  useEffect(() => {
    loadParkingSpots()
      .then(spots => { setAllSpots(spots); setDataLoaded(true); })
      .catch(() => setDataError('Failed to load parking data.'));
  }, []);

  // Auto-request GPS when switching to Current mode
  useEffect(() => {
    if (locationMode === 'current' && geo.status === 'idle') {
      geo.request();
    }
  }, [locationMode, geo.status, geo.request]);

  // Sync GPS coords into unified searchCoords
  useEffect(() => {
    if (locationMode === 'current' && geo.coords) {
      setSearchCoords(geo.coords);
      setSearchLabel(null);
    }
  }, [locationMode, geo.coords]);

  // Re-filter whenever the search origin, radius, or checkboxes change
  useEffect(() => {
    if (!searchCoords || !dataLoaded) return;
    const filtered = applyFilters(allSpots, weekendOnly, freeOnly);
    if (radius === 'nearest') {
      setNearbySpots(findTopNSpots(filtered, searchCoords.lat, searchCoords.lng, 10));
    } else {
      setNearbySpots(findNearbySpots(filtered, searchCoords.lat, searchCoords.lng, RADIUS_MILES[radius]));
    }
  }, [searchCoords, radius, dataLoaded, allSpots, weekendOnly, freeOnly]);

  const handleModeChange = newMode => {
    setLocationMode(newMode);
    setSearchCoords(null);
    setSearchLabel(null);
    setNearbySpots([]);
    setGeocodeStatus('idle');
    setGeocodeError(null);
    if (newMode === 'manual') geo.reset();
  };

  const handleManualSearch = async address => {
    setGeocodeStatus('loading');
    setGeocodeError(null);
    setSearchCoords(null);
    setNearbySpots([]);
    try {
      const { lat, lng, displayName } = await geocodeAddress(address);
      setSearchCoords({ lat, lng });
      setSearchLabel(displayName);
      setGeocodeStatus('idle');
    } catch (err) {
      setGeocodeStatus('error');
      setGeocodeError(err.message);
    }
  };

  const radiusLabel = radius === 'nearest'
    ? 'Nearest 10'
    : RADIUS_OPTIONS.find(r => r.value === radius)?.label;

  // True when we have results to display (both modes share the same result panel)
  const showResults = searchCoords !== null;

  return (
    <Row>
      <Col md={4} className="mb-4">
        <SearchFilters
          locationMode={locationMode}
          onLocationModeChange={handleModeChange}
          radius={radius}
          onRadiusChange={setRadius}
          geoStatus={geo.status}
          geoError={geo.error}
          coords={geo.coords}
          onRequestLocation={geo.request}
          onSearch={handleManualSearch}
          geocodeStatus={geocodeStatus}
          geocodeError={geocodeError}
          weekendOnly={weekendOnly}
          onWeekendChange={setWeekendOnly}
          freeOnly={freeOnly}
          onFreeChange={setFreeOnly}
        />
      </Col>

      <Col md={8}>
        {dataError && <Alert variant="danger">{dataError}</Alert>}

        {/* ── Manual mode states ── */}
        {locationMode === 'manual' && geocodeStatus === 'loading' && (
          <div className="text-center py-5">
            <Spinner animation="border" className="mb-3" />
            <p className="text-muted">Looking up address…</p>
          </div>
        )}
        {locationMode === 'manual' && geocodeStatus !== 'loading' && !showResults && (
          <div className="text-center text-muted py-5">
            Enter an address above to find nearby ADA parking.
          </div>
        )}

        {/* ── Current (GPS) mode states ── */}
        {locationMode === 'current' && geo.status === 'requesting' && (
          <div className="text-center py-5">
            <Spinner animation="border" className="mb-3" />
            <p className="text-muted">Requesting your location…</p>
          </div>
        )}
        {locationMode === 'current' && (geo.status === 'denied' || geo.status === 'error') && (
          <Alert variant="warning">
            <strong>Location unavailable.</strong> {geo.error}
          </Alert>
        )}

        {/* ── Shared results panel ── */}
        {showResults && (
          <>
            <div className="d-flex align-items-center mb-2 gap-2">
              <h5 className="mb-0">
                {nearbySpots.length} ADA Spot{nearbySpots.length !== 1 ? 's' : ''} Found
              </h5>
              <Badge bg="secondary">{radiusLabel}</Badge>
            </div>
            {searchLabel && (
              <p className="text-muted small mb-3" title={searchLabel}>
                Near: {searchLabel.split(',').slice(0, 3).join(',')}
              </p>
            )}
            {nearbySpots.length === 0 ? (
              <Alert variant="info">
                {radius === 'nearest'
                  ? 'No spots found after applying the active filters.'
                  : 'No spots within this radius. Try expanding the search area or selecting "Nearest 10 spots".'}
              </Alert>
            ) : (
              nearbySpots.map(spot => <ParkingSpot key={spot.id} spot={spot} />)
            )}
          </>
        )}
      </Col>
    </Row>
  );
};

// ── SavedPage ─────────────────────────────────────────────────────────────────

const SavedPage = () => {
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
                    {parseInt(spot.timeLimitHr) > 0 ? `${spot.timeLimitHr}hr ` : ''}
                    {parseInt(spot.timeLimitMin) > 0 ? `${spot.timeLimitMin}min ` : ''}
                    limit · {spot.enforced}
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
};

// ── AboutPage ─────────────────────────────────────────────────────────────────

const AboutPage = () => (
  <Container className="py-4">
    <h2 className="mb-3">About Madison ParkWise</h2>
    <p className="text-muted">
      Madison ParkWise helps you find ADA on-street parking in Madison, WI.
    </p>
    <Card className="shadow-sm border-0">
      <Card.Body>
        <Card.Title>Project Overview</Card.Title>
        <Card.Text>
          This app uses your GPS location and the City of Madison&rsquo;s ADA parking
          dataset to show the nearest accessible spaces within your chosen radius.
        </Card.Text>
        <Card.Text>
          Built with React, React Router, and React Bootstrap.
        </Card.Text>
      </Card.Body>
    </Card>
  </Container>
);

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Router basename="/p30">
      <div className="App">
        <PrimaryNav />
        <Container>
          <Routes>
            <Route path="/" element={<FinderPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </Container>
        <footer className="text-center mt-5 py-3 text-muted">
          &copy; 2024 Madison Parking Project
        </footer>
      </div>
    </Router>
  );
}
