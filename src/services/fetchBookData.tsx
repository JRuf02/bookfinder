export async function fetchBookData(isbn: string) {
  const url = `https://services.dnb.de/sru/dnb?version=1.1&operation=searchRetrieve&query="${isbn}"&recordSchema=MARC21-xml&maximumRecords=1`;
  try {
    const response = await fetch(url);
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");
    const title =
      xmlDoc.querySelector('datafield[tag="245"] > subfield[code="a"]')
        ?.textContent || "Unknown Title";
    const author =
      xmlDoc.querySelector('datafield[tag="100"] > subfield[code="a"]')
        ?.textContent || "Unknown Author";
    return { title, author };
  } catch (e) {
    return { title: "Error fetching data", author: "" };
  }
}
