import { Book } from "../../types/Book";
import { Result } from "../../types/Result";

type FetchBookDataOptions = {
  signal?: AbortSignal; // Optional signal for aborting the fetch request
};

export async function fetchBookData(
  isbn: string,
  options: FetchBookDataOptions = {},
): Promise<Result<Book>> {
  // Use relative URL to ensure protocol matching (HTTP or HTTPS)
  const response = await fetch(`/api/book?isbn=${isbn}`, {
    signal: options.signal,
  });

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

  return { ok: true, data: data.data as Book };
}
