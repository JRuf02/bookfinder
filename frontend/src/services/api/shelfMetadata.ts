export type ShelfMetadata = {
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
};

export async function fetchShelfMetadata(
  osmId: string,
): Promise<ShelfMetadata | null> {
  try {
    const resp = await fetch(
      `/api/shelf/metadata?osm_id=${encodeURIComponent(osmId)}`,
    );
    if (!resp.ok) return null;
    const resp_json = await resp.json();
    return resp_json.data;
  } catch {
    return null;
  }
}
