// TODO: Error handling for removing non-existing entry

// Send POST to insert or remove book from shelf
export async function shelfAction(
  action: "insert" | "remove",
  osmId: string,
  isbn: string
): Promise<{ success: boolean; message: string }> {
  const url = action === "insert" ? "/api/shelf/insert" : "/api/shelf/remove";
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ osm_id: osmId, isbn }),
    });
    const data = await resp.json();
    if (resp.ok) {
      return { success: true, message: data.message || "Action successful!" };
    } else {
      return {
        success: false,
        message: data.error || "Error performing action.",
      };
    }
  } catch {
    return { success: false, message: "Network or server error." };
  }
}
