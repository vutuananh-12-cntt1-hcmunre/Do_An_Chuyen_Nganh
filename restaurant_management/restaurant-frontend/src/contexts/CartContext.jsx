import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "restaurant_cart_v1";

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (dish, quantity = 1) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === dish.id);

      if (existing) {
        return current.map((item) =>
          item.id === dish.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...current,
        {
          id: dish.id,
          name: dish.name,
          price: Number(dish.price) || 0,
          image: dish.image || "",
          quantity,
          itemNote: "",
        },
      ];
    });
  };

  const changeQuantity = (id, amount) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const setQuantity = (id, quantity) => {
    const next = Number(quantity);
    if (!Number.isFinite(next) || next <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: next } : item
      )
    );
  };

  const updateItemNote = (id, value) => {
    setCart((current) =>
      current.map((item) =>
        item.id === id ? { ...item, itemNote: value } : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart]
  );

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [cart]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        addToCart,
        changeQuantity,
        setQuantity,
        updateItemNote,
        removeFromCart,
        clearCart,
        setCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart phải được sử dụng bên trong CartProvider");
  }

  return context;
}
