import { removeOsmIdPrefix } from "../services/prefix";

export type Shelf = {
  osmId: string;
  name?: string;
  latitude: number;
  longitude: number;
  address?: string;
  type?: string;
  operator?: string;
  website?: string;
  openingHours?: string;
  osmCheckDate?: string; // When the shelf data was last verified on OpenStreetMap
  osmLastUpdated: string; // When any part of the shelf data was last updated or added on OpenStreetMap
};

export type LocatedShelf = {
  shelf: Shelf;
  distanceMeters: number | null;
};

export function getShelfRepresentation(
  shelf?: Shelf | null,
  fallback = "No shelf selected",
): string {
  return (
    shelf?.name ||
    shelf?.operator ||
    shelf?.address ||
    removeOsmIdPrefix(shelf?.osmId) ||
    fallback
  );
}
