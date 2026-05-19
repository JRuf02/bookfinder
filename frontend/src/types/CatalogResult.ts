import { Book } from "./Book";
import { LocatedShelf } from "./Shelf";

export type CatalogResult = {
  entityId: number;
  book: Book;
  locatedShelf: LocatedShelf;
  inShelfSince: string;
};
