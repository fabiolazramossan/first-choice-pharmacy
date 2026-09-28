"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url?: string | null;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  hydrated: boolean;
  itemCount: number;
  subtotal: number;
  /** Adds `quantity` (default 1) of a product; the line is capped at 10 and the cart at 25 lines. */
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  /** Applies current catalog data (price/name/image) and caps quantities to what is available. */
  applyAvailability: (current: { id: string; name: string; price: number; image_url: string | null; max_quantity: number }[]) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "first-choice-pharmacy-cart";
const MAX_QUANTITY = 10;
const MAX_LINES = 25;

function isSavedCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CartItem>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.slug === "string" &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    item.price >= 0 &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity >= 1
  );
}

function safeProductImage(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (
      url.protocol === "https:" &&
      url.hostname === "vhwpotmsdmaqizkvgowl.supabase.co" &&
      url.pathname.startsWith("/storage/v1/object/public/")
    ) {
      return value;
    }
  } catch {
    return null;
  }
  return null;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = saved ? JSON.parse(saved) : [];
      if (Array.isArray(parsed)) {
        setItems(
          parsed
            .filter(isSavedCartItem)
            .slice(0, MAX_LINES)
            .map((item) => ({
              ...item,
              image_url: safeProductImage(item.image_url),
              quantity: Math.min(item.quantity, MAX_QUANTITY),
            }))
        );
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    const safeItem = { ...item, image_url: safeProductImage(item.image_url) };
    const amount = Number.isInteger(quantity) && quantity > 0 ? Math.min(quantity, MAX_QUANTITY) : 1;
    setItems((current) => {
      const existing = current.find((x) => x.id === safeItem.id);
      if (existing) {
        return current.map((x) =>
          x.id === safeItem.id
            ? { ...x, quantity: Math.min(x.quantity + amount, MAX_QUANTITY) }
            : x
        );
      }
      // Same 25-line limit the order API enforces.
      if (current.length >= MAX_LINES) return current;
      return [...current, { ...safeItem, quantity: amount }];
    });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((current) => current.filter((x) => x.id !== id));
      return;
    }
    setItems((current) =>
      current.map((x) =>
        x.id === id ? { ...x, quantity: Math.min(quantity, MAX_QUANTITY) } : x
      )
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((x) => x.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const applyAvailability = useCallback<CartContextValue["applyAvailability"]>((current) => {
    const byId = new Map(current.map((c) => [c.id, c]));
    setItems((items) =>
      items.map((item) => {
        const latest = byId.get(item.id);
        if (!latest) return item; // unavailable: kept so the customer sees it and can remove it
        return {
          ...item,
          name: latest.name,
          price: latest.price,
          image_url: safeProductImage(latest.image_url),
          quantity: latest.max_quantity > 0 ? Math.min(item.quantity, latest.max_quantity) : item.quantity,
        };
      })
    );
  }, []);

  const value = useMemo(
    () => ({
      items,
      hydrated,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      applyAvailability,
    }),
    [addItem, applyAvailability, clearCart, hydrated, items, removeItem, updateQuantity]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
