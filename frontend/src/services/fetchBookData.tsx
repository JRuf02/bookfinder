export async function fetchBookData(isbn: string) {
  try {
    // Use relative URL to ensure protocol matching (HTTP or HTTPS)
    const url = `/api/book?isbn=${isbn}`; // vite needs to proxy the call to the api

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (e) {
    console.error("Error fetching book data:", e);
    return { title: "Error fetching data", author: "", dnbIsbn: "", dnbId: "" };
  }
}
