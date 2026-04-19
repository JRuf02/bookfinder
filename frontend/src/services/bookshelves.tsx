export type Bookshelf = {
  osmId: string;
  name?: string;
  latitude: number;
  longitude: number;
  address?: string;
  type?: string;
  operator?: string;
  website?: string;
  openingHours?: string;
  osmCheckDate?: string;
  osmLastUpdated?: string;
};

export async function fetchAllBookshelves(): Promise<Bookshelf[]> {
  try {
    const resp = await fetch("/api/bookshelves");
    if (!resp.ok) return [];
    const resp_json = await resp.json();
    return resp_json.data;
  } catch {
    return [];
  }
}
