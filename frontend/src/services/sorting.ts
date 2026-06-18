// This file contains utility functions for sorting, such as comparing timestamp strings.

import { CatalogResult } from "../types/CatalogResult";

export type SortMode = "relevance" | "distance" | "newest" | "oldest";

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

/** Sort catalog results based on the given sort mode */
export function sortCatalogResults(
  results: CatalogResult[],
  sortMode: SortMode,
): CatalogResult[] {
  if (sortMode === "relevance") {
    return results;
  }

  return [...results].sort((left, right) => {
    if (sortMode === "distance") {
      const leftDistance = left.locatedShelf?.distanceMeters;
      const rightDistance = right.locatedShelf?.distanceMeters;

      if (leftDistance == null && rightDistance == null) {
        return 0;
      }

      // If only one of the results has distance data, prioritize that one
      // Should not happen (Backend will always return distance if user location is provided)
      if (leftDistance == null) {
        return 1;
      }

      if (rightDistance == null) {
        return -1;
      }

      return leftDistance - rightDistance;
    }

    if (sortMode === "newest") {
      return -compareTimestampStrings(left.inShelfSince, right.inShelfSince);
    }

    return compareTimestampStrings(left.inShelfSince, right.inShelfSince);
  });
}
