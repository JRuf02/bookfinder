import { CatalogResult } from "../types/CatalogResult";
import { Result } from "../types/Result";
import { LocatedShelf, Shelf } from "../types/Shelf";

export async function fetchShelfBooks(
  shelf: Shelf,
): Promise<Result<CatalogResult[]>> {
  try {
    const response = await fetch(
      `/api/shelf/books?osm_id=${encodeURIComponent(shelf.osmId)}`,
    );

    if (response.status == 500) {
      return { ok: false, error: "Internal server error. Try again later." };
    }

    let data: any;
    try {
      data = await response.json();
    } catch {
      return { ok: false, error: "Invalid JSON response." };
    }

    if (!response.ok) {
      return {
        ok: false,
        error: data?.message || `Request failed (${response.status})`,
      };
    }

    const books = (data.data ?? []).map(
      (result: { locatedShelf: LocatedShelf | null }) => ({
        ...result,
        locatedShelf: result.locatedShelf ?? {
          shelf,
          distanceMeters: null,
        },
      }),
    );

    return { ok: true, data: books };
  } catch {
    return { ok: false, error: "Network or server error." };
  }
}
