import { Shelf } from "../types/Shelf";

export interface AppState {
  currentShelf: Shelf | null;
}

export type AppAction =
  | { type: "SET_CURRENT_SHELF"; payload: Shelf }
  | { type: "CLEAR_CURRENT_SHELF" };
