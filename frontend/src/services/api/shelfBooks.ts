import { CatalogResult } from "../../types/CatalogResult";
import { Result } from "../../types/Result";
import { Shelf } from "../../types/Shelf";

/** Fetch all books that are currently on the given shelf. */
export async function fetchShelfBooks(
  shelf: Shelf,
): Promise<Result<CatalogResult[]>> {
  // This function could be merged with those from catalogSearch.ts
  const standardErrorMessage =
    "An error occurred while fetching books for this shelf. Please try again later.";

  try {
    const response = await fetch(
      `/api/shelf/books?osm_id=${encodeURIComponent(shelf.osmId)}`,
    );

    // Severe server errors where the response body may not be reliable
    if (response.status == 500) {
      return {
        ok: false,
        error: standardErrorMessage,
      };
    }

    let data: Result<CatalogResult[]>;

    try {
      const responseJson = (await response.json()) as {
        status: "success" | "error";
        data?: CatalogResult[];
        message?: string;
      };

      data =
        response.ok && responseJson.status === "success"
          ? { ok: true, data: responseJson.data ?? [] }
          : {
              ok: false,
              error: responseJson.message ?? standardErrorMessage,
            };
    } catch {
      console.error("Failed to parse JSON response:", await response.text());
      return { ok: false, error: standardErrorMessage };
    }

    if (!data.ok) {
      return data;
    }

    // Create a list of CatalogResult objects, add the shelf info if missing
    const books: CatalogResult[] = data.data.map((result: CatalogResult) => ({
      ...result,
      locatedShelf: result.locatedShelf ?? {
        shelf,
        distanceMeters: null,
      },
    }));

    return { ok: true, data: books };
  } catch {
    return { ok: false, error: standardErrorMessage };
  }
}
