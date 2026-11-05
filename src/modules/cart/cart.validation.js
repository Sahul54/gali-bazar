
import { z } from "zod";

// ==========================================
// ADD ITEM TO CART VALIDATION
// ==========================================

export const addToCartSchema = z.object({
  variantId: z
    .string()
    .trim()
    .min(1, "Product variant is required."),

  quantity: z
    .number()
    .int("Quantity must be a whole number.")
    .min(1, "Minimum quantity is 1.")
    .max(100, "Maximum quantity is 100.")
    .default(1),
});

// ==========================================
// UPDATE CART ITEM VALIDATION
// ==========================================

export const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int("Quantity must be a whole number.")
    .min(1, "Minimum quantity is 1.")
    .max(100, "Maximum quantity is 100."),
});

// ==========================================
// CART ITEM ID VALIDATION
// ==========================================

export const cartItemIdSchema = z.object({
  itemId: z
    .string()
    .trim()
    .min(1, "Cart item ID is required."),
});
