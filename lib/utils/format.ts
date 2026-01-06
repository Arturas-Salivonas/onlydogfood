/**
 * Format price with currency symbol
 */
export function formatPrice(
  amount: number,
  currency: string = 'GBP'
): string {
  const symbols: Record<string, string> = {
    GBP: '£',
    USD: '$',
    EUR: '€',
    AUD: 'A$',
  };

  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Calculate price per feed based on product data
 * Assumes average 20kg dog eating 2% of body weight per day
 */
export function calculatePricePerFeed(
  pricePerKg: number,
  servingSize: number = 400 // grams per day for average dog
): number {
  return (pricePerKg / 1000) * servingSize;
}

/**
 * Calculate monthly cost estimate
 */
export function calculateMonthlyCost(pricePerFeed: number): number {
  return pricePerFeed * 30;
}

/**
 * Format price per feed display
 */
export function formatPricePerFeed(pricePerKg: number, servingSize: number = 400): string {
  const pricePerFeed = calculatePricePerFeed(pricePerKg, servingSize);
  return formatPrice(pricePerFeed);
}

/**
 * Format number with commas (e.g., 1000 -> 1,000)
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-GB');
}
