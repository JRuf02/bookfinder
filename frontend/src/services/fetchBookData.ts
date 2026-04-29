import { Book } from "../types/Book";
import { Result } from "../types/Result";

export async function fetchBookData(isbn: string): Promise<Result<Book>> {
  // Use relative URL to ensure protocol matching (HTTP or HTTPS)
  const response = await fetch(`/api/book?isbn=${isbn}`);

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

  return { ok: true, data: data.data as Book };
}
