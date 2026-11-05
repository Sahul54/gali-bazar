
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = useCallback((product, variant, quantity = 1) => {
    if (!product?.id || !variant?.id) return;

    const availableStock = Math.max(
      0,
      Number(variant.inventory?.quantity || 0) -
        Number(variant.inventory?.reservedQuantity || 0)
    );

    if (availableStock <= 0) return;

    setCartItems((previousItems) => {
      const existingItem = previousItems.find(
        (item) =>
          item.productId === product.id &&
          item.variantId === variant.id
      );

      if (existingItem) {
        return previousItems.map((item) =>
          item.variantId === variant.id &&
          item.productId === product.id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + quantity,
                  availableStock
                ),
                availableStock,
              }
            : item
        );
      }

      return [
        ...previousItems,
        {
          productId: product.id,
          variantId: variant.id,
          name: product.name,
          image: product.images?.[0]?.imageUrl || null,
          variantTitle: variant.title || variant.sku || "Standard",
          price: Number(variant.price),
          quantity: Math.min(quantity, availableStock),
          availableStock,
          shopId: product.sellerProfileId,
          shopName: product.sellerProfile?.businessName || "",
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((variantId, quantity) => {
    setCartItems((previousItems) =>
      previousItems
        .map((item) =>
          item.variantId === variantId
            ? {
                ...item,
                quantity: Math.min(
                  Math.max(1, quantity),
                  item.availableStock
                ),
              }
            : item
        )
    );
  }, []);

  const removeFromCart = useCallback((variantId) => {
    setCartItems((previousItems) =>
      previousItems.filter(
        (item) => item.variantId !== variantId
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
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
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
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
