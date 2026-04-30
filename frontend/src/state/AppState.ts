import { Shelf } from "../types/Shelf";

export interface AppState {
  selectedShelf?: Shelf;
  preSelectedShelfAction: "insert" | "remove" | "both";
}

export type AppAction =
  | { type: "SET_SELECTED_SHELF"; payload: Shelf }
  | { type: "CLEAR_SELECTED_SHELF" }
  | { type: "RESET_PRESELECTED_SHELF_ACTION" }
  | {
      type: "SET_PRESELECTED_SHELF_ACTION";
      payload: "insert" | "remove" | "both";
    };
