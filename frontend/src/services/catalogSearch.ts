import { CatalogResult } from "../types/CatalogResult";
import { GeoCoordinates } from "../types/GeoCoordinates";
import { Result } from "../types/Result";

/** Execute the catalog search request given by the url and return the results. */
async function executeCatalogSearch(
  url: string,
): Promise<Result<CatalogResult[]>> {
  // TODO: Move error messages to a shared constants file
  const standardErrorMessage =
    "An error occurred while fetching search results. Please try again later.";

  try {
    const response = await fetch(url);

    // Severe server errors where the response body may not be reliable
    if (response.status === 500) {
      return {
        ok: false,
        error: "There seems to be an issue with the server. Try again later.",
      };
    }

    let responseJson: { data?: CatalogResult[]; message?: string };

    try {
      responseJson = await response.json();
    } catch {
      console.error("Failed to parse JSON response:", await response.text());

      return {
        ok: false,
        error: standardErrorMessage,
      };
    }

    // Bad user input and other specific issues where the backend may send an error message
    if (!response.ok) {
      return {
        ok: false,
        error:
          responseJson.message ||
          "Could not fetch results. Please try again later.",
      };
    }

    return {
      ok: true,
      data: responseJson.data ?? [],
    };
  } catch (error) {
    console.error("Network error:", error);

    return {
      ok: false,
      error:
        "Network or server error. Please check your connection or try again later.",
    };
  }
}

/**
 * Search the catalog for books matching the search term either with their title, author or ISBN.
 * Queries the /api/catalog/search/single-term endpoint.
 * If a location is provided, the backend will compute distances to the shelves of the results.
 */
export async function singleTermCatalogSearch(
  searchTerm: string,
  userCoords: GeoCoordinates | null = null,
): Promise<Result<CatalogResult[]>> {
  // Generate the URL with proper encoding and optional location parameters
  const url = `/api/catalog/search/single-term?q=${encodeURIComponent(searchTerm)}${
    userCoords
      ? `&lat=${encodeURIComponent(userCoords.latitude)}&lon=${encodeURIComponent(userCoords.longitude)}`
      : ""
  }`;

  return await executeCatalogSearch(url);
}

/**
 * Query the backend for books in the current catalog matching the given author and/or title.
 * Queries the /api/catalog/search endpoint.
 * If a location is provided, the backend will compute distances to the shelves of the results.
 */
export async function titleAuthorCatalogSearch(
  title: string,
  author: string,
  location?: GeoCoordinates | null,
): Promise<Result<CatalogResult[]>> {
  // build query params safely
  const params = new URLSearchParams({ title, author });

  // only request & send location if toggle is enabled
  if (location) {
    params.append("lat", location.latitude.toString());
    params.append("lon", location.longitude.toString());
  }

  return await executeCatalogSearch(`/api/catalog/search?${params.toString()}`);
}
