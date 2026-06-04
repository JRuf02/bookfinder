import { Book } from "../types/Book";
import { Result } from "../types/Result";

type FetchBookDataOptions = {
  signal?: AbortSignal;
};

export async function fetchBookData(
  isbn: string,
  options: FetchBookDataOptions = {},
): Promise<Result<Book>> {
  // Use relative URL to ensure protocol matching (HTTP or HTTPS)
  const response = await fetch(`/api/book?isbn=${isbn}`, {
    signal: options.signal,
  });

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
