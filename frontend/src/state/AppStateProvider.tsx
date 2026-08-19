// global app state management

import React, { createContext, useContext, useReducer } from "react";

import { appReducer, initialState } from "./AppReducer";
import { AppAction, AppState } from "./AppState";

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

// eslint-disable-next-line react-refresh/only-export-components
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};
