import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import { loadParkingSpots, findNearbySpots, findTopNSpots, geocodeAddress } from '../utils/parkingData.js';
import { RADIUS_MILES } from '../utils/geo.js';
import { RADIUS_OPTIONS } from '../constants.js';
import { getVisitStatus } from '../utils/enforcement.js';
import VisitFilters from './VisitFilters.jsx';
import VisitSummary from './VisitSummary.jsx';
import VisitSpotList from './VisitSpotList.jsx';
import VisitMap from './VisitMap.jsx';
import EmptyState from './EmptyState.jsx';

// ─── Default form values ─────────────────────────────────────────────────────

function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function nowTimeStr() {
  const now = new Date();
  // Round to nearest 30-minute block
  const totalMins = now.getHours() * 60 + now.getMinutes();
  const rounded = Math.round(totalMins / 30) * 30;
  const h = Math.floor(rounded / 60) % 24;
  const m = rounded % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PlanVisitPage() {
  // Form state
  const [address, setAddress] = useState('');
  const [visitDate, setVisitDate] = useState(todayStr);
  const [arrivalTime, setArrivalTime] = useState(nowTimeStr);
  const [stayMinutes, setStayMinutes] = useState(60);
  const [radius, setRadius] = useState('2');

  // Search state
  const [geocodeStatus, setGeocodeStatus] = useState('idle');
  const [geocodeError, setGeocodeError] = useState(null);
  const [searchCoords, setSearchCoords] = useState(null);
  const [searchLabel, setSearchLabel] = useState(null);
  const [allSpots, setAllSpots] = useState([]);
  const [nearbySpots, setNearbySpots] = useState([]);
  const [dataError, setDataError] = useState(null);

  // Interaction state
  const [selectedSpotId, setSelectedSpotId] = useState(null);
  const [selectedSpot, setSelectedSpot] = useState(null);

  // Load CSV once on mount
  useEffect(() => {
    loadParkingSpots()
      .then(spots => setAllSpots(spots))
      .catch(() => setDataError('Failed to load parking data.'));
  }, []);

  // Re-run nearby search whenever coords, radius, or data change
  useEffect(() => {
    if (!searchCoords || !allSpots.length) return;
    if (radius === 'nearest') {
      setNearbySpots(findTopNSpots(allSpots, searchCoords.lat, searchCoords.lng, 10));
    } else {
      setNearbySpots(findNearbySpots(allSpots, searchCoords.lat, searchCoords.lng, RADIUS_MILES[radius]));
    }
    setSelectedSpotId(null);
    setSelectedSpot(null);
  }, [searchCoords, radius, allSpots]);

  // Derive day index + arrival minutes from the date/time inputs
  const { dayIndex, arrivalMins } = useMemo(() => {
    if (!visitDate || !arrivalTime) return { dayIndex: null, arrivalMins: null };
    const dt = new Date(`${visitDate}T${arrivalTime}`);
    if (isNaN(dt.getTime())) return { dayIndex: null, arrivalMins: null };
    return {
      dayIndex: dt.getDay(),                              // 0=Sun … 6=Sat
      arrivalMins: dt.getHours() * 60 + dt.getMinutes(), // minutes from midnight
    };
  }, [visitDate, arrivalTime]);

  // Compute status for every nearby spot — updates live as time/stay changes
  const statusMap = useMemo(() => {
    if (!nearbySpots.length || dayIndex === null || arrivalMins === null) return {};
    const map = {};
    for (const spot of nearbySpots) {
      map[spot.id] = getVisitStatus(spot, dayIndex, arrivalMins, stayMinutes);
    }
    return map;
  }, [nearbySpots, dayIndex, arrivalMins, stayMinutes]);

  // Aggregate counts for the summary strip
  const counts = useMemo(() => {
    const vals = Object.values(statusMap);
    return {
      free:    vals.filter(v => v === 'free').length,
      fits:    vals.filter(v => v === 'fits').length,
      exceeds: vals.filter(v => v === 'exceeds').length,
      total:   vals.length,
    };
  }, [statusMap]);

  const radiusLabel = radius === 'nearest'
    ? 'Nearest 10'
    : RADIUS_OPTIONS.find(r => r.value === radius)?.label;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSearch = async addr => {
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

  const handleSpotSelect = spot => {
    setSelectedSpotId(spot.id);
    setSelectedSpot(spot);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const hasResults = nearbySpots.length > 0;

  return (
    <Row>
      {/* Left column: form + spot list */}
      <Col md={4} className="mb-4">
        <VisitFilters
          address={address}
          onAddressChange={setAddress}
          onSearch={handleSearch}
          geocodeStatus={geocodeStatus}
          geocodeError={geocodeError}
          visitDate={visitDate}
          onVisitDateChange={setVisitDate}
          arrivalTime={arrivalTime}
          onArrivalTimeChange={setArrivalTime}
          stayMinutes={stayMinutes}
          onStayChange={setStayMinutes}
          radius={radius}
          onRadiusChange={setRadius}
        />

        {hasResults && (
          <VisitSpotList
            spots={nearbySpots}
            statusMap={statusMap}
            selectedId={selectedSpotId}
            onSelect={handleSpotSelect}
          />
        )}

        {searchCoords && !hasResults && geocodeStatus !== 'loading' && (
          <EmptyState
            icon="🔍"
            title="No spots found"
            message={
              radius === 'nearest'
                ? 'No data available near this address.'
                : 'Try expanding the search radius.'
            }
          />
        )}
      </Col>

      {/* Right column: summary + map */}
      <Col md={8}>
        {dataError && <Alert variant="danger">{dataError}</Alert>}

        {geocodeStatus === 'error' && !geocodeError && (
          <Alert variant="warning">Address not found. Try adding more detail.</Alert>
        )}

        {hasResults && (
          <>
            <VisitSummary counts={counts} radiusLabel={radiusLabel} />
            {searchLabel && (
              <p className="text-muted small mb-2">
                Near: {searchLabel.split(',').slice(0, 3).join(',')}
              </p>
            )}
            <p className="text-muted small mb-2" style={{ fontSize: '0.75rem' }}>
              Status updates live — adjust date, time, or stay duration above to see it change.
            </p>
          </>
        )}

        {!searchCoords && geocodeStatus !== 'loading' && (
          <div className="text-center text-muted py-5" role="status">
            <div aria-hidden="true" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🗓️</div>
            <p className="fw-semibold mb-1">Enter a destination to get started</p>
            <p className="small">
              Set your date, arrival time, and stay duration, then enter
              the address you're visiting to see which spots work for you.
            </p>
          </div>
        )}

        <VisitMap
          spots={nearbySpots}
          statusMap={statusMap}
          searchCoords={searchCoords}
          selectedSpot={selectedSpot}
          selectedSpotId={selectedSpotId}
        />
      </Col>
    </Row>
  );
}
