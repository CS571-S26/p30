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
  window.dispatchEvent(new CustomEvent('pw:saved-change'));
}

export function persistRemove(spotId) {
  const updated = getSavedSpots().filter(s => s.id !== spotId);
  localStorage.setItem('savedParkingSpots', JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('pw:saved-change'));
}

// ── Search history (persists across sessions) ─────────────────────────────────

export function getSearchHistory() {
  try {
    return JSON.parse(localStorage.getItem('pw_search_history') || '[]');
  } catch {
    return [];
  }
}

export function addSearchHistory(address) {
  const prev = getSearchHistory().filter(h => h.toLowerCase() !== address.toLowerCase());
  localStorage.setItem('pw_search_history', JSON.stringify([address, ...prev].slice(0, 5)));
}

export function readFinderSession() {
  try {
    return JSON.parse(sessionStorage.getItem('pw_finder')) || {};
  } catch {
    return {};
  }
}
