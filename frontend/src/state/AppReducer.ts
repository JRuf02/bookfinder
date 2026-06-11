// Create global app state and define actions on the app state

import { AppAction, AppState } from "./AppState";

export const initialState: AppState = {
  selectedShelf: undefined,
  preSelectedShelfAction: "both",
  userCoordinates: undefined,
};

export function appReducer(state: AppState, action: AppAction): AppState {
  const actionType = action.type;
  switch (actionType) {
    case "SET_SELECTED_SHELF":
      return { ...state, selectedShelf: action.payload };
    case "CLEAR_SELECTED_SHELF":
      return { ...state, selectedShelf: undefined };
    case "SET_USER_COORDINATES":
      return { ...state, userCoordinates: action.payload };
    case "CLEAR_USER_COORDINATES":
      return { ...state, userCoordinates: undefined };
    case "SET_PRESELECTED_SHELF_ACTION":
      return { ...state, preSelectedShelfAction: action.payload };
    case "RESET_PRESELECTED_SHELF_ACTION":
      return { ...state, preSelectedShelfAction: "both" };
  }
}
