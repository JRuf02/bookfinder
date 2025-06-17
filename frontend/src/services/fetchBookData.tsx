export async function fetchBookData(isbn: string) {
  // Get current host ip
  const host = window.location.hostname;
  const url = `http://${host}:5000/api/books?isbn=${isbn}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (e) {
    console.error("Error fetching book data:", e);
    return { title: "Error fetching data", author: "", dnbISBN: "", dnbId: "" };
  }
}
