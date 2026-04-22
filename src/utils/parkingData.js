import { convertToLatLng, haversineDistance } from './geo.js';

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
