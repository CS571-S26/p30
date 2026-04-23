import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  Navbar, Nav, Container, Row, Col,
  Card, Button, Form, InputGroup,
  Alert, Spinner, Badge,
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import './App.css';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
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

function formatTimeLimit(timeLimitMin) {
  const total = parseInt(timeLimitMin);
  if (isNaN(total) || total <= 0) return 'No limit listed';
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours > 0 && mins > 0) return `${hours}hr ${mins}min limit`;
  if (hours > 0) return `${hours}-hour limit`;
  return `${total}-minute limit`;
}

function readFinderSession() {
  try { return JSON.parse(sessionStorage.getItem('pw_finder')) || {}; } catch { return {}; }
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
  address, onAddressChange,
  onSearch,
  geocodeStatus,
  geocodeError,
  weekendOnly, onWeekendChange,
  freeOnly, onFreeChange,
}) => {
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
};

// ── Map components ────────────────────────────────────────────────────────────

const MADISON_CENTER = [43.0742, -89.3837];

function MapFlyTo({ center, selectedSpot }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo([center.lat, center.lng], 15, { duration: 0.8 });
  }, [center, map]);
  useEffect(() => {
    if (selectedSpot) map.flyTo([selectedSpot.lat, selectedSpot.lng], 18, { duration: 0.6 });
  }, [selectedSpot, map]);
  return null;
}

const SpotPopup = ({ spot }) => {
  const [saved, setSaved] = useState(() => !!getSavedSpots().find(s => s.id === spot.id));
  return (
    <div style={{ minWidth: '170px' }}>
      <strong style={{ fontSize: '0.88rem' }}>{spot.street}</strong>
      <div style={{ fontSize: '0.78rem', color: '#6c757d', marginTop: 2 }}>
        {spot.side} Side
        {spot.distance != null ? ` · ${spot.distance.toFixed(2)} mi away` : ''}
      </div>
      <hr style={{ margin: '6px 0' }} />
      <div style={{ fontSize: '0.8rem' }}>{formatTimeLimit(spot.timeLimitMin)}</div>
      <div style={{ fontSize: '0.8rem' }}>{spot.enforced}</div>
      <div style={{ fontSize: '0.8rem', marginBottom: 6, color: spot.status === 'In service' ? '#198754' : '#6c757d' }}>
        {spot.status}
      </div>
      <button
        className={`btn btn-sm ${saved ? 'btn-success' : 'btn-primary'} w-100`}
        style={{ fontSize: '0.78rem' }}
        onClick={() => { persistSave(spot); setSaved(true); }}
        disabled={saved}
      >
        {saved ? 'Saved ✓' : 'Save Spot'}
      </button>
    </div>
  );
};

const SpotList = ({ spots, selectedId, onSelect }) => {
  if (!spots.length) return null;
  return (
    <div className="mt-3">
      <div className="fw-semibold small text-muted mb-1 px-1">
        {spots.length} spot{spots.length !== 1 ? 's' : ''} — click to locate on map
      </div>
      <div style={{ maxHeight: '38vh', overflowY: 'auto', borderRadius: '8px', border: '1px solid #dee2e6' }}>
        {spots.map((spot, i) => (
          <div
            key={spot.id}
            onClick={() => onSelect(spot)}
            style={{
              cursor: 'pointer',
              padding: '8px 12px',
              borderBottom: i < spots.length - 1 ? '1px solid #f0f0f0' : 'none',
              background: selectedId === spot.id ? '#fff3e0' : 'white',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{spot.street}</div>
            <div style={{ fontSize: '0.76rem', color: '#6c757d' }}>
              {spot.side} Side · {spot.distance.toFixed(2)} mi away
            </div>
            <div style={{ fontSize: '0.76rem', color: '#495057' }}>
              {formatTimeLimit(spot.timeLimitMin)} · {spot.enforced}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ParkingMap = ({ spots, searchCoords, selectedSpot, selectedSpotId }) => (
  <MapContainer
    center={MADISON_CENTER}
    zoom={13}
    scrollWheelZoom
    style={{ height: '68vh', minHeight: '520px', width: '100%', borderRadius: '8px' }}
  >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <MapFlyTo center={searchCoords} selectedSpot={selectedSpot} />
    {searchCoords && (
      <CircleMarker
        center={[searchCoords.lat, searchCoords.lng]}
        radius={9}
        pathOptions={{ color: 'white', fillColor: '#2b7fff', fillOpacity: 0.9, weight: 2 }}
      />
    )}
    {spots.map(spot => {
      const isSelected = spot.id === selectedSpotId;
      return (
        <CircleMarker
          key={spot.id}
          center={[spot.lat, spot.lng]}
          radius={isSelected ? 12 : 9}
          pathOptions={isSelected
            ? { color: 'white', fillColor: '#ff6d00', fillOpacity: 1, weight: 2.5 }
            : { color: 'white', fillColor: '#e53935', fillOpacity: 1, weight: 2 }
          }
        >
          <Popup>
            <SpotPopup spot={spot} />
          </Popup>
        </CircleMarker>
      );
    })}
  </MapContainer>
);

// ── FinderPage ────────────────────────────────────────────────────────────────

const FinderPage = () => {
  const geo = useGeolocation();
  const [locationMode, setLocationMode] = useState(() => readFinderSession().locationMode ?? 'manual');
  const [radius, setRadius] = useState(() => readFinderSession().radius ?? '2');
  const [allSpots, setAllSpots] = useState([]);
  const [nearbySpots, setNearbySpots] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [dataError, setDataError] = useState(null);

  const [searchCoords, setSearchCoords] = useState(() => readFinderSession().searchCoords ?? null);
  const [searchLabel, setSearchLabel] = useState(() => readFinderSession().searchLabel ?? null);

  const [geocodeStatus, setGeocodeStatus] = useState('idle');
  const [geocodeError, setGeocodeError] = useState(null);

  const [weekendOnly, setWeekendOnly] = useState(() => readFinderSession().weekendOnly ?? false);
  const [freeOnly, setFreeOnly] = useState(() => readFinderSession().freeOnly ?? false);
  const [address, setAddress] = useState(() => readFinderSession().address ?? '');

  const [selectedSpotId, setSelectedSpotId] = useState(null);
  const [selectedSpot, setSelectedSpot] = useState(null);

  // Load CSV once on mount
  useEffect(() => {
    loadParkingSpots()
      .then(spots => { setAllSpots(spots); setDataLoaded(true); })
      .catch(() => setDataError('Failed to load parking data.'));
  }, []);

  // Persist finder query to sessionStorage so navigating away and back restores state
  useEffect(() => {
    sessionStorage.setItem('pw_finder', JSON.stringify({
      locationMode, radius, searchCoords, searchLabel, weekendOnly, freeOnly, address,
    }));
  }, [locationMode, radius, searchCoords, searchLabel, weekendOnly, freeOnly, address]);

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

  const handleSpotSelect = spot => {
    setSelectedSpotId(spot.id);
    setSelectedSpot(spot);
  };

  const handleModeChange = newMode => {
    setLocationMode(newMode);
    setSearchCoords(null);
    setSearchLabel(null);
    setNearbySpots([]);
    setGeocodeStatus('idle');
    setGeocodeError(null);
    setSelectedSpotId(null);
    setSelectedSpot(null);
    if (newMode === 'manual') geo.reset();
  };

  const handleManualSearch = async address => {
    setGeocodeStatus('loading');
    setGeocodeError(null);
    setSearchCoords(null);
    setNearbySpots([]);
    setSelectedSpotId(null);
    setSelectedSpot(null);
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
          address={address}
          onAddressChange={setAddress}
          onSearch={handleManualSearch}
          geocodeStatus={geocodeStatus}
          geocodeError={geocodeError}
          weekendOnly={weekendOnly}
          onWeekendChange={setWeekendOnly}
          freeOnly={freeOnly}
          onFreeChange={setFreeOnly}
        />
        <SpotList
          spots={nearbySpots}
          selectedId={selectedSpotId}
          onSelect={handleSpotSelect}
        />
      </Col>

      <Col md={8}>
        {dataError && <Alert variant="danger">{dataError}</Alert>}

        {/* Status messages above map */}
        {(geocodeStatus === 'loading' || (locationMode === 'current' && geo.status === 'requesting')) && (
          <div className="d-flex align-items-center gap-2 mb-2 text-muted small">
            <Spinner animation="border" size="sm" />
            {geocodeStatus === 'loading' ? 'Looking up address…' : 'Requesting your location…'}
          </div>
        )}
        {locationMode === 'current' && (geo.status === 'denied' || geo.status === 'error') && (
          <Alert variant="warning" className="py-2 mb-2">
            <strong>Location unavailable.</strong> {geo.error}
          </Alert>
        )}

        {showResults && (
          <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
            <h5 className="mb-0">
              {nearbySpots.length} ADA Spot{nearbySpots.length !== 1 ? 's' : ''} Found
            </h5>
            <Badge bg="secondary">{radiusLabel}</Badge>
            {nearbySpots.length === 0 && (
              <span className="text-muted small">
                {radius === 'nearest'
                  ? '— no spots match the active filters'
                  : '— try expanding the search area'}
              </span>
            )}
          </div>
        )}
        {showResults && searchLabel && (
          <p className="text-muted small mb-2" title={searchLabel}>
            Near: {searchLabel.split(',').slice(0, 3).join(',')}
          </p>
        )}

        <ParkingMap
          spots={nearbySpots}
          searchCoords={searchCoords}
          selectedSpot={selectedSpot}
          selectedSpotId={selectedSpotId}
        />
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
