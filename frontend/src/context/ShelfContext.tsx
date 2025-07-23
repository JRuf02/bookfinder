import { createContext, useContext, useState, ReactNode } from "react";

type ShelfContextType = {
  shelfId: string | null;
  setShelfId: (id: string | null) => void;
};

const ShelfContext = createContext<ShelfContextType | undefined>(undefined);

export function ShelfProvider({ children }: { children: ReactNode }) {
  const [shelfId, setShelfIdState] = useState<string | null>(null);

  // Load from localStorage on mount
  /*useEffect(() => {
    const stored = localStorage.getItem("currentShelfId");
    if (stored) setShelfIdState(stored);
  }, []);*/

  // Save to localStorage on change
  /*useEffect(() => {
    if (shelfId) {
      localStorage.setItem("currentShelfId", shelfId);
    } else {
      localStorage.removeItem("currentShelfId");
    }
  }, [shelfId]);*/

  const setShelfId = (id: string | null) => setShelfIdState(id);

  return (
    <ShelfContext.Provider value={{ shelfId, setShelfId }}>
      {children}
    </ShelfContext.Provider>
  );
}

export function useShelf() {
  const ctx = useContext(ShelfContext);
  if (!ctx) throw new Error("useShelf must be used within ShelfProvider");
  return ctx;
}
