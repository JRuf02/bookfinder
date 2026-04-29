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
  osmCheckDate: string;
  osmLastUpdated?: string;
};

export type LocatedShelf = {
  shelf: Shelf;
  distanceMeters: number | null;
};
