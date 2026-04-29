import { AppAction, AppState } from "./AppState";

export const initialState: AppState = {
  currentShelf: null,
};

export function appReducer(state: AppState, action: AppAction): AppState {
  const actionType = action.type;
  switch (actionType) {
    case "SET_CURRENT_SHELF":
      return { ...state, currentShelf: action.payload };
    case "CLEAR_CURRENT_SHELF":
      return { ...state, currentShelf: null };
    default:
      console.warn(`Unhandled action type: ${actionType}`);
      return state;
  }
}
