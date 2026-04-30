import { Book } from "./Book";
import { Shelf } from "./Shelf";

export type ShelfAction = {
  book: Book;
  action: "insert" | "remove";
  shelf?: Shelf;
};
