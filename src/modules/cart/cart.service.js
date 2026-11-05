
import {
  findOrCreateCart,
  findCartByUserId,
  findCartItem,
  findPurchasableVariant,
  upsertCartItem,
  updateCartItemQuantity,
  deleteCartItem,
  clearCartItems,
} from "./cart.repository";

// ==========================================
// CUSTOM ERROR
// ==========================================

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// ==========================================
// STOCK VALIDATION
// ==========================================

function getAvailableStock(inventory) {
  if (!inventory) return 0;

  return Math.max(
    0,
    inventory.quantity - inventory.reservedQuantity
  );
}

// ==========================================
// CART SUMMARY
// ==========================================

function formatCart(cart) {
  if (!cart) {
    return {
      id: null,
      items: [],
      totalItems: 0,
      subtotal: 0,
    };
  }

  const items = cart.items.map((item) => {
    const variant = item.variant;
    const product = variant.product;

    const unitPrice = Number(variant.price);

    return {
      id: item.id,
      variantId: variant.id,
      productId: product.id,
      productName: product.name,
      variantTitle: variant.title,
      sku: variant.sku,
      image: product.images[0]?.imageUrl || null,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
      availableStock: getAvailableStock(variant.inventory),
      seller: product.sellerProfile,
    };
  });

  return {
    id: cart.id,
    items,
    totalItems: items.reduce(
      (total, item) => total + item.quantity,
      0
    ),
    subtotal: Number(
      items.reduce(
        (total, item) => total + item.lineTotal,
        0
      ).toFixed(2)
    ),
  };
}

// ==========================================
// GET CUSTOMER CART
// ==========================================

export async function getCustomerCart(userId) {
  if (!userId) {
    throw createError("Authentication required.", 401);
  }

  const cart = await findOrCreateCart(userId);

  return formatCart(cart);
}

// ==========================================
// ADD ITEM TO CART
// ==========================================

export async function addItemToCart(userId, variantId, quantity = 1) {
  if (!userId) {
    throw createError("Authentication required.", 401);
  }

  if (!variantId) {
    throw createError("Product variant is required.");
  }

  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 100
  ) {
    throw createError("Quantity must be between 1 and 100.");
  }

  const variant = await findPurchasableVariant(variantId);

  if (!variant) {
    throw createError(
      "Product is unavailable or no longer active.",
      404
    );
  }

  const availableStock = getAvailableStock(variant.inventory);

  if (availableStock < 1) {
    throw createError("This product is currently out of stock.");
  }

  const cart = await findOrCreateCart(userId);

  const existingItem = await findCartItem(
    cart.id,
    variantId
  );

  const newQuantity =
    (existingItem?.quantity || 0) + quantity;

  if (newQuantity > availableStock) {
    throw createError(
      `Only ${availableStock} units are available.`
    );
  }

  await upsertCartItem(
    cart.id,
    variantId,
    quantity
  );

  const updatedCart = await findCartByUserId(userId);

  return formatCart(updatedCart);
}

// ==========================================
// UPDATE CART ITEM QUANTITY
// ==========================================

export async function updateCartItem(userId, itemId, quantity) {
  if (!userId) {
    throw createError("Authentication required.", 401);
  }

  if (!itemId) {
    throw createError("Cart item ID is required.");
  }

  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 100
  ) {
    throw createError("Quantity must be between 1 and 100.");
  }

  const cart = await findCartByUserId(userId);

  if (!cart) {
    throw createError("Cart not found.", 404);
  }

  const item = cart.items.find(
    (cartItem) => cartItem.id === itemId
  );

  if (!item) {
    throw createError("Cart item not found.", 404);
  }

  const variant = await findPurchasableVariant(
    item.variantId
  );

  if (!variant) {
    throw createError("Product is no longer available.", 404);
  }

  const availableStock = getAvailableStock(variant.inventory);

  if (quantity > availableStock) {
    throw createError(
      `Only ${availableStock} units are available.`
    );
  }

  await updateCartItemQuantity(itemId, quantity);

  const updatedCart = await findCartByUserId(userId);

  return formatCart(updatedCart);
}

// ==========================================
// REMOVE ITEM FROM CART
// ==========================================

export async function removeCartItem(userId, itemId) {
  if (!userId) {
    throw createError("Authentication required.", 401);
  }

  if (!itemId) {
    throw createError("Cart item ID is required.");
  }

  const cart = await findCartByUserId(userId);

  if (!cart) {
    throw createError("Cart not found.", 404);
  }

  const item = cart.items.find(
    (cartItem) => cartItem.id === itemId
  );

  if (!item) {
    throw createError("Cart item not found.", 404);
  }

  await deleteCartItem(itemId);

  const updatedCart = await findCartByUserId(userId);

  return formatCart(updatedCart);
}

// ==========================================
// CLEAR CUSTOMER CART
// ==========================================

export async function clearCustomerCart(userId) {
  if (!userId) {
    throw createError("Authentication required.", 401);
  }

  const cart = await findOrCreateCart(userId);

  await clearCartItems(cart.id);

  return {
    success: true,
    message: "Cart cleared successfully.",
  };
}
