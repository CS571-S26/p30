export function getSavedSpots() {
  try {
    return JSON.parse(localStorage.getItem('savedParkingSpots') || '[]');
  } catch {
    return [];
  }
}

export function persistSave(spot) {
  const current = getSavedSpots();
  if (current.find(s => s.id === spot.id)) return;
  localStorage.setItem('savedParkingSpots', JSON.stringify([...current, spot]));
}

export function persistRemove(spotId) {
  const updated = getSavedSpots().filter(s => s.id !== spotId);
  localStorage.setItem('savedParkingSpots', JSON.stringify(updated));
}

export function readFinderSession() {
  try {
    return JSON.parse(sessionStorage.getItem('pw_finder')) || {};
  } catch {
    return {};
  }
}
