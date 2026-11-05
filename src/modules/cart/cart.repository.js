
import { prisma} from "@/lib/prisma";

// ==========================================
// CART INCLUDE CONFIGURATION
// ==========================================

const cartInclude = {
  items: {
    include: {
      variant: {
        include: {
          product: {
            include: {
              images: {
                orderBy: {
                  sortOrder: "asc",
                },
                take: 1,
              },
              sellerProfile: {
                select: {
                  id: true,
                  businessName: true,
                  status: true,
                },
              },
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          inventory: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  },
};

// ==========================================
// GET OR CREATE CUSTOMER CART
// ==========================================

export async function findOrCreateCart(userId) {
  return prisma.cart.upsert({
    where: {
      userId,
    },
    update: {},
    create: {
      userId,
    },
    include: cartInclude,
  });
}

// ==========================================
// FIND CUSTOMER CART
// ==========================================

export async function findCartByUserId(userId) {
  return prisma.cart.findUnique({
    where: {
      userId,
    },
    include: cartInclude,
  });
}

// ==========================================
// FIND CART ITEM
// ==========================================

export async function findCartItem(cartId, variantId) {
  return prisma.cartItem.findUnique({
    where: {
      cartId_variantId: {
        cartId,
        variantId,
      },
    },
  });
}

// ==========================================
// FIND PURCHASABLE PRODUCT VARIANT
// ==========================================

export async function findPurchasableVariant(variantId) {
  return prisma.productVariant.findFirst({
    where: {
      id: variantId,
      isActive: true,
      product: {
        status: "ACTIVE",
        sellerProfile: {
          status: "APPROVED",
          user: {
            isActive: true,
          },
        },
      },
    },
    include: {
      product: {
        include: {
          images: {
            orderBy: {
              sortOrder: "asc",
            },
            take: 1,
          },
          sellerProfile: {
            select: {
              id: true,
              businessName: true,
              status: true,
            },
          },
        },
      },
      inventory: true,
    },
  });
}

// ==========================================
// CREATE CART ITEM
// ==========================================

export async function createCartItem(cartId, variantId, quantity) {
  return prisma.cartItem.create({
    data: {
      cartId,
      variantId,
      quantity,
    },
  });
}

// ==========================================
// UPDATE CART ITEM QUANTITY
// ==========================================

export async function updateCartItemQuantity(itemId, quantity) {
  return prisma.cartItem.update({
    where: {
      id: itemId,
    },
    data: {
      quantity,
    },
  });
}

// ==========================================
// UPSERT CART ITEM
// ==========================================

export async function upsertCartItem(cartId, variantId, quantity) {
  return prisma.cartItem.upsert({
    where: {
      cartId_variantId: {
        cartId,
        variantId,
      },
    },
    update: {
      quantity: {
        increment: quantity,
      },
    },
    create: {
      cartId,
      variantId,
      quantity,
    },
  });
}

// ==========================================
// DELETE CART ITEM
// ==========================================

export async function deleteCartItem(itemId) {
  return prisma.cartItem.delete({
    where: {
      id: itemId,
    },
  });
}

// ==========================================
// DELETE ALL CART ITEMS
// ==========================================

export async function clearCartItems(cartId) {
  return prisma.cartItem.deleteMany({
    where: {
      cartId,
    },
  });
}

// ==========================================
// DELETE CUSTOMER CART
// ==========================================

export async function deleteCartByUserId(userId) {
  return prisma.cart.deleteMany({
    where: {
      userId,
    },
  });
}

// ==========================================
// COUNT CART ITEMS
// ==========================================

export async function countCartItems(cartId) {
  const result = await prisma.cartItem.aggregate({
    where: {
      cartId,
    },
    _sum: {
      quantity: true,
    },
  });

  return result._sum.quantity || 0;
}
