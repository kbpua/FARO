export function formatDistance(km?: number): string {
  if (km === undefined || km === null) return '';
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} m away`;
  }
  return `${km.toFixed(1)} km away`;
}

export function formatPrice(level: number): string {
  if (level <= 0) return 'Free / Unrated';
  if (level === 1) return '$ (Budget)';
  if (level === 2) return '$$ (Moderate)';
  if (level === 3) return '$$$ (Splurge)';
  return '$$$$ (Fine Dining)';
}

export function getPriceSymbols(level: number): string {
  if (level <= 0) return '$';
  return '$'.repeat(Math.min(level, 4));
}
