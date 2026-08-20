import { Book, BookPopularity } from "../../types/Book";
import { Result } from "../../types/Result";

type ApiResponse<T> =
  | {
      status: "success";
      data: T;
    }
  | {
      status: "error";
      message: string;
    };

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

  let data: ApiResponse<Book>;
  try {
    data = await response.json();
  } catch {
    return { ok: false, error: "Invalid JSON response." };
  }

  if (data.status === "error") {
    return {
      ok: false,
      error: data.message || `Request failed with code ${response.status}.`,
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      error: `Request failed with code ${response.status}.`,
    };
  }

  return { ok: true, data: data.data as Book };
}

export async function fetchBookPopularity(
  isbn: string,
): Promise<Result<BookPopularity>> {
  const response = await fetch(`/api/book/popularity?isbn=${isbn}`);

  if (response.status == 500) {
    return { ok: false, error: "Internal server error. Try again later." };
  }

  let data: ApiResponse<BookPopularity>;
  try {
    data = await response.json();
  } catch {
    return { ok: false, error: "Invalid JSON response." };
  }

  if (data.status === "error") {
    return {
      ok: false,
      error: data.message || `Request failed with code ${response.status}.`,
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      error: `Request failed with code ${response.status}.`,
    };
  }

  console.log("Fetched book popularity data:", data.data);

  return { ok: true, data: data.data as BookPopularity };
}
