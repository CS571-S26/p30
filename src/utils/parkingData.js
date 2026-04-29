import { convertToLatLng, haversineDistance } from './geo.js';

// ─── ADA Parking Spaces (CSV) ─────────────────────────────────────────────────

let cachedSpots = null;

export async function loadParkingSpots() {
  if (cachedSpots) return cachedSpots;

  const res = await fetch('/p30/data/On-Street_ADA_Parking_Spaces.csv');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const text = await res.text();
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  cachedSpots = lines
    .slice(1)
    .map(line => {
      const values = line.split(',');
      const row = {};
      headers.forEach((h, i) => {
        row[h] = values[i]?.trim() ?? '';
      });

      const x = parseFloat(row.X);
      const y = parseFloat(row.Y);
      if (isNaN(x) || isNaN(y)) return null;

      const { lat, lng } = convertToLatLng(x, y);
      return {
        id: row.OBJECTID,
        source: 'ada',
        lat,
        lng,
        street: [row.St_Pre_Dir, row.St_Name, row.St_Name_Suf]
          .filter(Boolean)
          .join(' '),
        side: row.Side_Of_St,
        blockNbr: row.Block_Nbr,
        timeLimitHr: row.Time_Limit_Hr,
        timeLimitMin: row.Time_Limit_Min,
        enforced: row.Enforced,
        status: row.Status,
        spaceLengthFt: row.SpaceLength_Ft,
        restriction: row.Restriction,
        spaceName: row.SpaceName,
        collectRoute: row.Collect_Route,
      };
    })
    .filter(Boolean);

  return cachedSpots;
}

// ─── Street Parking Restrictions (GeoJSON) ────────────────────────────────────

let cachedRestrictions = null;

// Returns the midpoint coordinate of a GeoJSON LineString or MultiLineString.
// GeoJSON coordinate order is [longitude, latitude].
function geomMidpoint(geometry) {
  const coords =
    geometry.type === 'LineString'
      ? geometry.coordinates
      : geometry.coordinates[0]; // first ring of MultiLineString
  const mid = coords[Math.floor(coords.length / 2)];
  return { lat: mid[1], lng: mid[0] };
}

// Friendly label for the restriction type shown as the spot "title"
function typeLabel(type) {
  const MAP = {
    '1HR': '1-Hour',
    '2HR': '2-Hour',
    '3HR': '3-Hour',
    '10MIN': '10-Minute',
    '15MIN': '15-Minute',
    '20MIN': '20-Minute',
    '30MIN': '30-Minute',
    'DIS/VET': 'Disabled / Veteran',
    'LZ': 'Loading Zone',
    'No Parking': 'No Parking',
    'Part Time Restriction': 'Part-Time',
    'Peak Hour Restriction AM': 'Peak Hour AM',
    'Peak Hour Restriction PM': 'Peak Hour PM',
    'Peak Hour Restriction AM&PM': 'Peak Hour AM & PM',
    'RP3 1HR': 'Resident Permit 1-Hour',
    'RP3 2HR': 'Resident Permit 2-Hour',
    'RPO': 'Resident Permit Only',
  };
  return MAP[type] ?? type ?? 'Parking Restriction';
}

export async function loadStreetRestrictions() {
  if (cachedRestrictions) return cachedRestrictions;

  const res = await fetch('/p30/data/Street_Parking_Restrictions.geojson');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const geojson = await res.json();

  cachedRestrictions = geojson.features
    .filter(f => f.geometry && f.geometry.coordinates?.length)
    .map(f => {
      const props = f.properties;
      const { lat, lng } = geomMidpoint(f.geometry);

      // Normalise time limit — dataset has a typo in the field name
      const timeLimitMin =
        props.TIme_LImit_Min != null ? String(props.TIme_LImit_Min) : null;
      const timeLimitHr =
        props.Time_Limit_Hr != null ? String(props.Time_Limit_Hr) : null;

      return {
        id: `r_${props.OBJECTID}`,
        source: 'restrictions',
        lat,
        lng,
        // Use the friendly type label as the display "street" — no street name in dataset
        street: typeLabel(props.Type),
        // Extra detail fields for the popup
        restrictionCode: props.Restriction || '',
        restrictionFull: props.Restr_txt_full || props.Restriction || '',
        rpArea: props.RP3_Area,
        segmentLengthFt: props.SHAPESTLength
          ? Math.round(props.SHAPESTLength)
          : null,
        // Unified schema fields
        side: null,
        timeLimitHr,
        timeLimitMin,
        enforced: props.Restriction || '',
        status: props.Type || '',
        spaceLengthFt: null,
        restriction: props.Type || '',
        spaceName: null,
        blockNbr: null,
        collectRoute: null,
      };
    });

  return cachedRestrictions;
}

export function findNearbySpots(spots, userLat, userLng, radiusMiles) {
  return spots
    .map(spot => ({
      ...spot,
      distance: haversineDistance(userLat, userLng, spot.lat, spot.lng),
    }))
    .filter(spot => spot.distance <= radiusMiles)
    .sort((a, b) => a.distance - b.distance);
}

export function findTopNSpots(spots, userLat, userLng, n = 10) {
  return spots
    .map(spot => ({
      ...spot,
      distance: haversineDistance(userLat, userLng, spot.lat, spot.lng),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, n);
}

// Geocodes a free-text address via Nominatim (OpenStreetMap).
// Appends ", Madison, WI" when the input doesn't already reference the city/state.
export async function geocodeAddress(rawAddress) {
  const hasMadison = /\b(madison|wi|wisconsin)\b/i.test(rawAddress);
  const query = hasMadison ? rawAddress : `${rawAddress}, Madison, WI`;

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '1',
    countrycodes: 'us',
  });

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    { headers: { Accept: 'application/json' } },
  );
  if (!res.ok) throw new Error(`Geocoding service error (${res.status})`);

  const data = await res.json();
  if (!data.length) {
    throw new Error('Address not found. Try adding more detail, e.g. "State St, Madison, WI".');
  }

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}
