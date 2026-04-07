import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'restaurant-public-cart';

export type CartLine = {
  name: string;
  unitPrice: number;
  quantity: number;
};

export type CartLinePayload = {
  name: string;
  quantity: number;
  unitPrice: number;
};

function loadFromStorage(): Record<string, CartLine> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, CartLine>;
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed;
  } catch {
    return {};
  }
}

function persist(cart: Record<string, CartLine>) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // ignore quota / private mode
  }
}

export function cartToLines(cart: Record<string, CartLine>): CartLinePayload[] {
  return Object.values(cart)
    .filter((l) => l.quantity > 0)
    .map((l) => ({
      name: l.name,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
    }));
}

type CartContextValue = {
  cart: Record<string, CartLine>;
  itemCount: number;
  totalSum: number;
  setQty: (itemId: string, name: string, unitPrice: number, nextQty: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Record<string, CartLine>>(() =>
    typeof window !== 'undefined' ? loadFromStorage() : {},
  );

  useEffect(() => {
    persist(cart);
  }, [cart]);

  const setQty = useCallback(
    (itemId: string, name: string, unitPrice: number, nextQty: number) => {
      setCart((prev) => {
        const next = { ...prev };
        if (nextQty <= 0) {
          delete next[itemId];
          return next;
        }
        next[itemId] = { name, unitPrice, quantity: nextQty };
        return next;
      });
    },
    [],
  );

  const clearCart = useCallback(() => {
    setCart({});
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const itemCount = useMemo(
    () => Object.values(cart).reduce((n, l) => n + l.quantity, 0),
    [cart],
  );

  const totalSum = useMemo(
    () => Object.values(cart).reduce((s, l) => s + l.quantity * l.unitPrice, 0),
    [cart],
  );

  const value = useMemo(
    () => ({
      cart,
      itemCount,
      totalSum,
      setQty,
      clearCart,
    }),
    [cart, itemCount, totalSum, setQty, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
