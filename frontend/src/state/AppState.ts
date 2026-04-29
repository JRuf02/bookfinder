import { Shelf } from "../types/Shelf";

export interface AppState {
  selectedShelf?: Shelf;
  scanMode: "insert" | "remove" | "both";
}

export type AppAction =
  | { type: "SET_SELECTED_SHELF"; payload: Shelf }
  | { type: "CLEAR_SELECTED_SHELF" }
  | { type: "SET_SCAN_MODE"; payload: "insert" | "remove" | "both" };
