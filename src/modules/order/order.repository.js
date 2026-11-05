
import { prisma } from "@/lib/prisma.js";

export const orderRepository = {
  // Create order with items and inventory reservation.
  async createOrder({
    customerId,
    orderNumber,
    deliveryType,
    deliveryAddress,
    deliveryLatitude = null,
    deliveryLongitude = null,
    scheduledDate = null,
    scheduledSlot = null,
    deliveryFee = 0,
    items,
  }) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("At least one order item is required.");
    }

    if (!customerId || !orderNumber || !deliveryAddress?.trim()) {
      throw new Error("Missing required order details.");
    }

    if (!["EXPRESS", "SCHEDULED"].includes(deliveryType)) {
      throw new Error("Invalid delivery type.");
    }

    if (
      deliveryType === "SCHEDULED" &&
      (!scheduledDate || !scheduledSlot)
    ) {
      throw new Error("Scheduled date and slot are required.");
    }

    if (
      deliveryType === "EXPRESS" &&
      (scheduledDate || scheduledSlot)
    ) {
      throw new Error("Express orders cannot have a scheduled slot.");
    }

    // Validate and merge duplicate variants.
    const itemMap = new Map();

    for (const item of items) {
      const variantId = item?.variantId;
      const quantity = Number(item?.quantity);

      if (!variantId || !Number.isSafeInteger(quantity) || quantity <= 0) {
        throw new Error("Invalid order item.");
      }

      const existingQuantity = itemMap.get(variantId) || 0;
      const updatedQuantity = existingQuantity + quantity;

      if (!Number.isSafeInteger(updatedQuantity)) {
        throw new Error("Invalid item quantity.");
      }

      itemMap.set(variantId, updatedQuantity);
    }

    const normalizedItems = Array.from(
      itemMap,
      ([variantId, quantity]) => ({ variantId, quantity })
    );

    const fee = Number(deliveryFee);

    if (!Number.isFinite(fee) || fee < 0) {
      throw new Error("Invalid delivery fee.");
    }

    const deliveryFeePaise = Math.round(fee * 100);

    if (!Number.isSafeInteger(deliveryFeePaise)) {
      throw new Error("Invalid delivery fee.");
    }

    return prisma.$transaction(
      async (tx) => {
        let subtotalPaise = 0;
        const orderItems = [];

        // 1. Validate products and reserve inventory.
        for (const item of normalizedItems) {
          const variant = await tx.productVariant.findUnique({
            where: {
              id: item.variantId,
            },
            include: {
              product: true,
              inventory: true,
            },
          });

          if (
            !variant ||
            !variant.isActive ||
            variant.product.status !== "ACTIVE"
          ) {
            throw new Error(
              `Product variant ${item.variantId} is unavailable.`
            );
          }

          if (!variant.inventory) {
            throw new Error(
              `Inventory not found for ${variant.sku}.`
            );
          }

          const inventory = variant.inventory;

          const availableQuantity =
            inventory.quantity - inventory.reservedQuantity;

          if (availableQuantity < item.quantity) {
            throw new Error(
              `Insufficient stock for ${variant.product.name}.`
            );
          }

          // 2. Reserve stock with a conditional database update.
          const reservation = await tx.inventory.updateMany({
            where: {
              id: inventory.id,
              quantity: {
                gte: item.quantity,
              },
              reservedQuantity: {
                lte: inventory.quantity - item.quantity,
              },
            },
            data: {
              reservedQuantity: {
                increment: item.quantity,
              },
            },
          });

          if (reservation.count !== 1) {
            throw new Error(
              `Stock changed for ${variant.product.name}. Please try again.`
            );
          }

          // 3. Calculate price from database.
          const unitPricePaise = Math.round(
            Number(variant.price) * 100
          );

          if (
            !Number.isSafeInteger(unitPricePaise) ||
            unitPricePaise < 0
          ) {
            throw new Error(
              `Invalid price for ${variant.product.name}.`
            );
          }

          const lineTotalPaise =
            unitPricePaise * item.quantity;

          if (!Number.isSafeInteger(lineTotalPaise)) {
            throw new Error("Order amount is too large.");
          }

          subtotalPaise += lineTotalPaise;

          if (!Number.isSafeInteger(subtotalPaise)) {
            throw new Error("Order subtotal is too large.");
          }

          orderItems.push({
            productName: variant.product.name,
            variantTitle: variant.title,
            sku: variant.sku,
            quantity: item.quantity,
            unitPrice: (unitPricePaise / 100).toFixed(2),
            lineTotal: (lineTotalPaise / 100).toFixed(2),
            productId: variant.productId,
            variantId: variant.id,
          });
        }

        // 4. Calculate final amount.
        const totalAmountPaise =
          subtotalPaise + deliveryFeePaise;

        if (!Number.isSafeInteger(totalAmountPaise)) {
          throw new Error("Order total is too large.");
        }

        // 5. Create order and items atomically.
        const order = await tx.order.create({
          data: {
            customerId,
            orderNumber,
            deliveryType,
            deliveryAddress: deliveryAddress.trim(),
            deliveryLatitude,
            deliveryLongitude,
            scheduledDate:
              deliveryType === "SCHEDULED"
                ? scheduledDate
                : null,
            scheduledSlot:
              deliveryType === "SCHEDULED"
                ? scheduledSlot
                : null,
            subtotal: (subtotalPaise / 100).toFixed(2),
            deliveryFee: (deliveryFeePaise / 100).toFixed(2),
            totalAmount: (totalAmountPaise / 100).toFixed(2),
            items: {
              create: orderItems,
            },
          },
          include: {
            items: true,
          },
        });

        return order;
      },
      {
        maxWait: 5000,
        timeout: 10000,
      }
    );
  },

  // Find order by ID.
  async findById(orderId) {
    return prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        assignedDeliveryPartner: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
        deliveryBatch: true,
      },
    });
  },

  // Find order by order number.
  async findByOrderNumber(orderNumber) {
    return prisma.order.findUnique({
      where: {
        orderNumber,
      },
      include: {
        items: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });
  },

  // Find customer's orders.
  async findByCustomer(
    customerId,
    { skip = 0, take = 10 } = {}
  ) {
    return prisma.order.findMany({
      where: {
        customerId,
      },
      include: {
        items: true,
        assignedDeliveryPartner: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
    });
  },

  // Count customer's orders.
  async countByCustomer(customerId) {
    return prisma.order.count({
      where: {
        customerId,
      },
    });
  },

  // Find orders ready for Express assignment.
  async findReadyExpressOrders({
    skip = 0,
    take = 20,
  } = {}) {
    return prisma.order.findMany({
      where: {
        status: "READY_FOR_PICKUP",
        deliveryType: "EXPRESS",
        assignedDeliveryPartnerId: null,
        deliveryBatchId: null,
      },
      include: {
        items: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      skip,
      take,
    });
  },
};
