
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";

const CartContext = createContext(null);

const CART_API = "/api/v1/cart";

function normalizeCartItems(items = []) {
  return items.map((item) => ({
    id: item.id,
    productId: item.productId,
    variantId: item.variantId,
    name: item.productName,
    image: item.image || null,
    variantTitle: item.variantTitle || item.sku || "Standard",
    price: Number(item.unitPrice),
    quantity: item.quantity,
    availableStock: item.availableStock,
    shopId: item.seller?.id || null,
    shopName: item.seller?.businessName || "",
  }));
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Something went wrong.");
  }

  return result;
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cart from database
  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await apiRequest(CART_API);

      setCartItems(normalizeCartItems(result.data?.items));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Add item to cart
  const addToCart = useCallback(
    async (product, variant, quantity = 1) => {
      if (!product?.id || !variant?.id) {
        return false;
      }

      try {
        setIsSyncing(true);
        setError(null);

        const result = await apiRequest(`${CART_API}/items`, {
          method: "POST",
          body: JSON.stringify({
            variantId: variant.id,
            quantity,
          }),
        });

        setCartItems(normalizeCartItems(result.data?.items));

        return true;
      } catch (err) {
        setError(err.message);
        return false;
      } finally {
        setIsSyncing(false);
      }
    },
    []
  );

  // Update item quantity
  const updateQuantity = useCallback(
    async (variantId, quantity) => {
      const item = cartItems.find(
        (cartItem) => cartItem.variantId === variantId
      );

      if (!item?.id) return false;

      try {
        setIsSyncing(true);
        setError(null);

        const result = await apiRequest(
          `${CART_API}/items/${item.id}`,
          {
            method: "PATCH",
            body: JSON.stringify({ quantity }),
          }
        );

        setCartItems(normalizeCartItems(result.data?.items));

        return true;
      } catch (err) {
        setError(err.message);
        return false;
      } finally {
        setIsSyncing(false);
      }
    },
    [cartItems]
  );

  // Remove item from cart
  const removeFromCart = useCallback(
    async (variantId) => {
      const item = cartItems.find(
        (cartItem) => cartItem.variantId === variantId
      );

      if (!item?.id) return false;

      try {
        setIsSyncing(true);
        setError(null);

        const result = await apiRequest(
          `${CART_API}/items/${item.id}`,
          { method: "DELETE" }
        );

        setCartItems(normalizeCartItems(result.data?.items));

        return true;
      } catch (err) {
        setError(err.message);
        return false;
      } finally {
        setIsSyncing(false);
      }
    },
    [cartItems]
  );

  // Clear entire cart
  const clearCart = useCallback(async () => {
    try {
      setIsSyncing(true);
      setError(null);

      await apiRequest(CART_API, {
        method: "DELETE",
      });

      setCartItems([]);

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const cartCount = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + item.quantity,
        0
      ),
    [cartItems]
  );

  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [cartItems]
  );

  const value = {
    cartItems,
    cartCount,
    cartTotal,
    isLoading,
    isSyncing,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCartContext must be used inside CartProvider"
    );
  }

  return context;
}
