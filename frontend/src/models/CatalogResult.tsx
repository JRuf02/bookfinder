import { Book } from "./Book";
import { LocatedShelf } from "./Shelf";

export type CatalogResult = {
  book: Book;
  locatedShelf: LocatedShelf;
};
