import { Book } from "./Book";
import { Shelf } from "./Shelf";

export type ShelfAction = {
  books: Book[];
  action: "insert" | "remove";
  shelf?: Shelf;
};
