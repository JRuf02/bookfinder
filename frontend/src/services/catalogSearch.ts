import { CatalogResult } from "../types/CatalogResult";
import { GeoCoordinates } from "../types/GeoCoordinates";
import { Result } from "../types/Result";

export async function singleTermCatalogSearch(
  searchTerm: string,
  userCoords: GeoCoordinates | null = null,
): Promise<Result<CatalogResult[]>> {
  try {
    const response = await fetch(
      `/api/catalog/search/single-term?q=${encodeURIComponent(searchTerm)}${userCoords ? `&lat=${userCoords.latitude}&lon=${userCoords.longitude}` : ""}`,
    );

    let data: { data?: CatalogResult[]; message?: string };
    try {
      data = (await response.json()) as {
        data?: CatalogResult[];
        message?: string;
      };
    } catch {
      return { ok: false, error: "Invalid JSON response." };
    }

    if (!response.ok) {
      return {
        ok: false,
        error: data?.message || `Request failed (${response.status})`,
      };
    }

    return { ok: true, data: data.data ?? [] };
  } catch {
    return { ok: false, error: "Network or server error." };
  }
}
