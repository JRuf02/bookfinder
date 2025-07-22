import { getUserLocation } from "./location";

export type Bookshelf = {
  osm_id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  type?: string;
  operator?: string;
  website?: string;
  opening_hours?: string;
  osm_check_date?: string;
  osm_last_updated?: string;
  distance_m?: number;
};

export async function getAllBookshelves(): Promise<Bookshelf[]> {
  try {
    const response = await fetch("/api/bookshelves");
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching bookshelves:", error);
    return [];
  }
}

export async function getNearbyBookshelves(
  radius: number = 5000
): Promise<Bookshelf[]> {
  try {
    const { lat, lon } = await getUserLocation();
    const response = await fetch(
      `/api/bookshelves/nearby?lat=${lat}&lon=${lon}&radius=${radius}`
    );
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching nearby bookshelves:", error);
    return [];
  }
}

export async function getShelfMetadata(
  osmId: string
): Promise<Bookshelf | null> {
  try {
    const response = await fetch(
      `/api/shelf/metadata?osm_id=${encodeURIComponent(osmId)}`
    );
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching shelf metadata:", error);
    return null;
  }
}
