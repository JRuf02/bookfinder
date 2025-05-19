export async function fetchBookData(isbn: string) {
  const url = `https://services.dnb.de/sru/dnb?version=1.1&operation=searchRetrieve&query="${isbn}"&recordSchema=MARC21-xml&maximumRecords=1`;
  try {
    const response = await fetch(url);
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");

    // Extract title and author
    const title =
      xmlDoc.querySelector('datafield[tag="245"] > subfield[code="a"]')
        ?.textContent || "Unknown Title";
    const author =
      xmlDoc.querySelector('datafield[tag="100"] > subfield[code="a"]')
        ?.textContent || "Unknown Author";

    // Extract the book's ISBN as it appears in the DNB (may differ in format)
    const dnbISBN =
      xmlDoc.querySelector('datafield[tag="020"] > subfield[code="9"]')
        ?.textContent || isbn;

    // Extract the DNB identifier
    const dnbId =
      xmlDoc.querySelector('controlfield[tag="001"]')?.textContent || "";

    return { title, author, dnbISBN, dnbId };
  } catch (e) {
    console.error("Error fetching book data:", e);
    return { title: "Error fetching data", author: "", dnbISBN: "", dnbId: "" };
  }
}
