// global app state management
// TODO: currentShelfId, currentBook, preSelectedShelfAction, etc. should go here (search for useState and decide per case)
//       Could also steer which screen should be shown (scanning, results, shelf action) based on state instead of passing props down from App.tsx

import React, { createContext, useReducer, useContext } from "react";
import { AppState, AppAction } from "./AppState";
import { appReducer, initialState } from "./AppReducer";

const AppStateContext = createContext<
  { state: AppState; dispatch: React.Dispatch<AppAction> } | undefined
>(undefined);

export const AppStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};

// TODO: bug: einmal auf karte insert drücken, inserten, dann zu catalog tab, dann wieder scan tab -> nur noch insert möglich
