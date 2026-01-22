/**
 * Scoring utilities for consistent score display across the app
 */

export const SCORE_RANGES = {
  excellent: { min: 85, max: 100, color: 'bg-green-600', label: 'Excellent' },
  good: { min: 70, max: 84, color: 'bg-blue-600', label: 'Good' },
  fair: { min: 55, max: 69, color: 'bg-yellow-600', label: 'Fair' },
  poor: { min: 0, max: 54, color: 'bg-red-600', label: 'Poor' },
} as const;

export type ScoreRange = keyof typeof SCORE_RANGES;

export interface ScoreData {
  color: string;
  label: string;
  className: string;
  range: ScoreRange;
}

/**
 * Get score color class for a given score
 * @param score - The score value (0-100)
 * @returns Tailwind background color class
 */
export function getScoreColor(score: number): string {
  if (score >= SCORE_RANGES.excellent.min) return SCORE_RANGES.excellent.color;
  if (score >= SCORE_RANGES.good.min) return SCORE_RANGES.good.color;
  if (score >= SCORE_RANGES.fair.min) return SCORE_RANGES.fair.color;
  return SCORE_RANGES.poor.color;
}

/**
 * Get complete score data including color, label, and className
 * @param score - The score value (0-100)
 * @returns ScoreData object with color, label, and className
 */
export function getScoreData(score: number): ScoreData {
  let range: ScoreRange;

  if (score >= SCORE_RANGES.excellent.min) {
    range = 'excellent';
  } else if (score >= SCORE_RANGES.good.min) {
    range = 'good';
  } else if (score >= SCORE_RANGES.fair.min) {
    range = 'fair';
  } else {
    range = 'poor';
  }

  const rangeData = SCORE_RANGES[range];

  return {
    color: rangeData.color,
    label: rangeData.label,
    className: `${rangeData.color} text-white`,
    range,
  };
}

/**
 * Get score label for a given score
 * @param score - The score value (0-100)
 * @returns Label string (Excellent, Good, Fair, Poor)
 */
export function getScoreLabel(score: number): string {
  return getScoreData(score).label;
}

/**
 * Format score for display with optional label
 * @param score - The score value (0-100)
 * @param showLabel - Whether to include the label
 * @returns Formatted score string
 */
export function formatScore(score: number, showLabel: boolean = false): string {
  const rounded = Math.round(score);
  if (showLabel) {
    return `${rounded} - ${getScoreLabel(score)}`;
  }
  return `${rounded}`;
}
