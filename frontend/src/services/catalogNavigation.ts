import { Shelf } from "../types/Shelf";

/**
 * Navigation state that can be passed when navigating to the CatalogScreen.
 * - initialView determines what the CatalogScreen should show immediately upon navigation
 * - shelf should only be provided if initialView is "shelf-books",
 * - searchTerm should only be provided if initialView is "single-term-search"
 */
export type CatalogNavigationState = {
  initialView?: "search" | "shelf-books" | "single-term-search";
  shelf?: Shelf;
  searchTerm?: string;
};

/** Extract website navigation state information */
export function getCatalogNavigationTargets(locationState: unknown): {
  shelfFromState: Shelf | null;
  searchTermFromState: string | null;
} {
  const navigationState =
    (locationState as CatalogNavigationState | null) ?? null;

  const shelfFromState =
    navigationState?.initialView === "shelf-books" && navigationState.shelf
      ? navigationState.shelf
      : null;

  const searchTermFromState =
    navigationState?.initialView === "single-term-search" &&
    navigationState.searchTerm
      ? navigationState.searchTerm
      : null;

  return { shelfFromState, searchTermFromState };
}
