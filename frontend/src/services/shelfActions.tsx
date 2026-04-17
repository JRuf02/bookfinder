// TODO: Add tests for this function!
// Normalize ISBN: keep only digits, and uppercase 'X' at the end if isbn ends with 'x' or 'X'
function normalizeIsbn(isbn: string): string {
  const endsWithX = isbn.trim().toUpperCase().endsWith("X");
  // Remove all non-digit characters
  const cleaned = isbn.replace(/[^0-9]/g, "");
  return endsWithX ? cleaned + "X" : cleaned;
}

// TODO: Error handling for removing non-existing entries (better only in routes/shelf.py)

// Send POST to insert or remove book from shelf
export async function shelfAction(
  action: "insert" | "remove",
  osmId: string,
  dnbIsbn: string,
): Promise<{ success: boolean; message: string }> {
  const url = action === "insert" ? "/api/shelf/insert" : "/api/shelf/remove";
  const isbn = normalizeIsbn(dnbIsbn);
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ osm_id: osmId, isbn: isbn }),
    });
    const data = await resp.json();
    if (resp.ok) {
      return { success: true, message: data.message || "Action successful!" };
    } else {
      return {
        success: false,
        message: data.message || "Error performing action.",
      };
    }
  } catch {
    return { success: false, message: "Network or server error." };
  }
}
