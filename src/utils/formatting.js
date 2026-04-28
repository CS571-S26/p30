export function formatTimeLimit(timeLimitMin) {
  const total = parseInt(timeLimitMin);
  if (isNaN(total) || total <= 0) return 'No limit listed';
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours > 0 && mins > 0) return `${hours}hr ${mins}min limit`;
  if (hours > 0) return `${hours}-hour limit`;
  return `${total}-minute limit`;
}
