import { Shelf } from "../types";

export async function fetchAllBookshelves(): Promise<Shelf[]> {
  try {
    const resp = await fetch("/api/bookshelves");
    if (!resp.ok) return [];
    const resp_json = await resp.json();
    return resp_json.data;
  } catch {
    return [];
  }
}
