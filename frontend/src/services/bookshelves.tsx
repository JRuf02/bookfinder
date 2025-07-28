export type Bookshelf = {
  osm_id: string;
  name?: string;
  latitude: number;
  longitude: number;
  address?: string;
  type?: string;
  operator?: string;
  website?: string;
  opening_hours?: string;
  osm_check_date?: string;
  osm_last_updated?: string;
};

export async function fetchAllBookshelves(): Promise<Bookshelf[]> {
  try {
    const resp = await fetch("/api/bookshelves");
    if (!resp.ok) return [];
    return await resp.json();
  } catch {
    return [];
  }
}
