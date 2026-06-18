// Communication with the api/manual-add endpoint for manually adding book metadata to the database

import { Book } from "../../types/Book";
import { ManualAddResponse } from "../../types/Result";

// All of the parameters (isbn, title, author) are required by the backend.
// We allow them to be optional here to get specific error messages from the backend.
export async function manuallyAddBook(
  isbn?: string,
  title?: string,
  author?: string,
): Promise<ManualAddResponse<Book>> {
  try {
    const resp = await fetch("/api/manual-add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isbn, title, author }),
    });

    const data = await resp.json();

    if (resp.status === 400) {
      return { status: "error", message: data.message || "Invalid request." };
    }

    if (resp.status === 200) {
      if (data.status === "warning") {
        return {
          status: "warning",
          message:
            data.message ||
            "Book already exists with different metadata. Using existing metadata.",
          data: data.data,
        };
      } else if (data.status === "success") {
        return { status: "success", data: data.data };
      } else {
        console.error("Unexpected response format:", data);
        return {
          status: data.status || "error",
          message: data.message || "Unexpected response from server.",
        };
      }
    }

    console.error("Unexpected response status:", resp.status, data);
    return {
      status: data.status || "error",
      message:
        data.message ||
        "There seems to be a problem with the server. Try again later.",
    };
  } catch {
    return {
      status: "error",
      message: "Network or server error. Try again later.",
    };
  }
}
