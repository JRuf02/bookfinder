import { createContext, useContext, useState, ReactNode } from "react";

type ShelfContextType = {
  currentShelfId: string | null;
  setCurrentShelfId: (id: string | null) => void;
};

const ShelfContext = createContext<ShelfContextType | undefined>(undefined);

export function ShelfProvider({ children }: { children: ReactNode }) {
  const [currentShelfId, setCurrentShelfId] = useState<string | null>(null);
  return (
    <ShelfContext.Provider value={{ currentShelfId, setCurrentShelfId }}>
      {children}
    </ShelfContext.Provider>
  );
}

export function useShelf() {
  const ctx = useContext(ShelfContext);
  if (!ctx) throw new Error("useShelf must be used within ShelfProvider");
  return ctx;
}
