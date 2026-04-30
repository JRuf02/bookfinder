import { GeoCoordinates } from "../types/GeoCoordinates";
import { Shelf } from "../types/Shelf";

export interface AppState {
  selectedShelf?: Shelf;
  userCoordinates?: GeoCoordinates;
  preSelectedShelfAction: "insert" | "remove" | "both";
}

export type AppAction =
  | { type: "SET_SELECTED_SHELF"; payload: Shelf }
  | { type: "CLEAR_SELECTED_SHELF" }
  | { type: "SET_USER_COORDINATES"; payload: GeoCoordinates }
  | { type: "CLEAR_USER_COORDINATES" }
  | {
      type: "SET_PRESELECTED_SHELF_ACTION";
      payload: "insert" | "remove" | "both";
    }
  | { type: "RESET_PRESELECTED_SHELF_ACTION" };
