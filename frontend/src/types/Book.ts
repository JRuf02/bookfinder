export type Book = {
  isbn: string;
  title?: string;
  author?: string;
  dnbId: string; // TODO: (?) make optional
  coverUrl?: string;
};
