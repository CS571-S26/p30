import proj4 from 'proj4';

// EPSG:8193 — NAD83(HARN) / WISCRS Dane County (ftUS)
// Lambert Conformal Conic, tangent at 43.0695°N, CM at -89.4222°W (through Madison)
// Source: https://epsg.io/8193
const WI_SOUTH =
  '+proj=lcc +lat_1=43.0695160375 +lat_0=43.0695160375 +lon_0=-89.4222222222222 ' +
  '+k_0=1.0000384786 +x_0=247193.294386589 +y_0=146591.989636779 ' +
  '+ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs';

export function convertToLatLng(x, y) {
  const [lng, lat] = proj4(WI_SOUTH, 'WGS84', [x, y]);
  return { lat, lng };
}

export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Madison block ≈ 300 ft; values in miles
export const RADIUS_MILES = {
  '2': 0.11,
  '5': 0.28,
  '10': 0.57,
};
