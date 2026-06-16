// This file contains utility functions for sorting, such as comparing timestamp strings.

/**
 * Compore two lexicographically sortable timestamp strings.
 * If one of the timestamps is missing, consider it older than the other.
 *
 * @returns 1 if a is newer than b, -1 if a is older than b, 0 if they are equal
 */
export function compareTimestampStrings(a?: string, b?: string): number {
  if (a == b) {
    return 0;
  }

  // If one timestamp is missing, consider it older than the other
  if (!a) {
    return -1;
  }

  if (!b) {
    return 1;
  }

  // Newer timestamps are lexicographically greater than older timestamps
  // e.g.: "2026-07-01 12:00:00" > "2026-06-30 23:59:59"
  return a > b ? 1 : -1;
}
