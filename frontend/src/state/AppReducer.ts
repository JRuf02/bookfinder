import { AppAction, AppState } from "./AppState";

export const initialState: AppState = {
  selectedShelf: undefined,
  preSelectedShelfAction: "both",
};

export function appReducer(state: AppState, action: AppAction): AppState {
  const actionType = action.type;
  switch (actionType) {
    case "SET_SELECTED_SHELF":
      return { ...state, selectedShelf: action.payload };
    case "CLEAR_SELECTED_SHELF":
      return { ...state, selectedShelf: undefined };
    case "SET_PRESELECTED_SHELF_ACTION":
      return { ...state, preSelectedShelfAction: action.payload };
    case "RESET_PRESELECTED_SHELF_ACTION":
      return { ...state, preSelectedShelfAction: "both" };
  }
}
