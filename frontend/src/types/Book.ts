export type Book = {
  isbn: string;
  title?: string;
  author?: string;
  dnbId: string;
  coverUrl?: string;
};

export type BookPopularity = {
  isbn: string;
  avgDaysUntilTakeout: number | null;
  currentlyOnShelves: number;
  totalBooksSeen: number;
  avgDaysOnShelfForCurrentBooks: number | null;
};
