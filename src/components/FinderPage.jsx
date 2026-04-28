import React, { useState, useEffect } from 'react';
import { Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import { useGeolocation } from '../hooks/useGeolocation.js';
import { loadParkingSpots, findNearbySpots, findTopNSpots, geocodeAddress } from '../utils/parkingData.js';
import { RADIUS_MILES } from '../utils/geo.js';
import { readFinderSession } from '../utils/storage.js';
import { RADIUS_OPTIONS } from '../constants.js';
import SearchFilters from './SearchFilters.jsx';
import SpotList from './SpotList.jsx';
import ParkingMap from './ParkingMap.jsx';

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

export default function FinderPage() {
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

  const handleManualSearch = async addr => {
    setGeocodeStatus('loading');
    setGeocodeError(null);
    setSearchCoords(null);
    setNearbySpots([]);
    setSelectedSpotId(null);
    setSelectedSpot(null);
    try {
      const { lat, lng, displayName } = await geocodeAddress(addr);
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
}
