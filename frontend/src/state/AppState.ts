// Define global app state interface and name possible actions on the app state

import { GeoCoordinates } from "../types/GeoCoordinates";
import { Shelf } from "../types/Shelf";

// TODO:(?) currentShelfId, currentBook, preSelectedShelfAction, etc. could go here (search for useState and decide per case)
//          Could also steer which screen should be shown (scanning, results, shelf action) based on state instead of passing props down from App.tsx

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
