import proj4 from 'proj4';

// WISCRS Dane County (EPSG:8193) - NAD83(HARN), Transverse Mercator, US Survey Feet
// This is the county-level CRS used by the City of Madison GIS department.
// Central meridian: -90°37'24"W, origin: 45°42'22"N, scale: 1.0000421521
const WI_SOUTH =
  '+proj=tmerc +lat_0=45.70611111111111 +lon_0=-90.62333333333334 ' +
  '+k=1.0000421521 +x_0=256946.9112573833 +y_0=0.009299999999999 ' +
  '+ellps=GRS80 +units=us-ft +no_defs';

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
