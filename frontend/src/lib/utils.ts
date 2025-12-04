import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as a percentage with 2 decimal places
 * @param value - The number to format (0-100 scale)
 * @returns Formatted percentage string (e.g., "72.78%")
 */
export function formatPercent(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "0.00%";
  }
  return `${value.toFixed(2)}%`;
}

/**
 * Format a score with 2 decimal places (no percentage sign)
 * @param value - The number to format
 * @returns Formatted score string (e.g., "7.25")
 */
export function formatScore(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "0.00";
  }
  return value.toFixed(2);
}
