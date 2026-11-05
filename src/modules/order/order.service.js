
import { orderRepository } from "./order.repository.js";
import { validateCreateOrder } from "./order.validation.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizePagination = (options = {}, defaultTake = 10) => {
  const requestedSkip = Number(options.skip);
  const requestedTake = Number(options.take);

  return {
    skip:
      Number.isSafeInteger(requestedSkip) && requestedSkip >= 0
        ? requestedSkip
        : 0,

    take:
      Number.isSafeInteger(requestedTake) && requestedTake > 0
        ? Math.min(requestedTake, 50)
        : defaultTake,
  };
};

export const orderService = {
  // Validate order creation request.
  validateOrderRequest(data) {
    const result = validateCreateOrder(data);

    if (!result.valid) {
      throw createError(result.errors.join(" "));
    }

    return true;
  },

  // Create new order.
  async createOrder(customerId, data) {
    if (!customerId) {
      throw createError("Customer authentication is required.", 401);
    }

    this.validateOrderRequest(data);

    const {
      deliveryType = "EXPRESS",
      deliveryAddress,
      deliveryLatitude,
      deliveryLongitude,
      scheduledDate = null,
      scheduledSlot = null,
      items,
    } = data;

    // Server-side delivery fee calculation.
    const deliveryFee = this.calculateDeliveryFee({
      deliveryType,
    });

    // Generate unique order number.
    const orderNumber = this.generateOrderNumber();

    try {
      return await orderRepository.createOrder({
        customerId,
        orderNumber,
        deliveryType,
        deliveryAddress,
        deliveryLatitude,
        deliveryLongitude,
        scheduledDate:
          deliveryType === "SCHEDULED"
            ? new Date(scheduledDate)
            : null,
        scheduledSlot:
          deliveryType === "SCHEDULED"
            ? scheduledSlot.trim()
            : null,
        deliveryFee,
        items,
      });
    } catch (error) {
      if (error.code === "P2002") {
        throw createError(
          "Order number already exists. Please try again.",
          409
        );
      }

      throw error;
    }
  },

  // Calculate delivery fee.
  // Temporary pricing; distance-based pricing will be added later.
  calculateDeliveryFee({ deliveryType }) {
    switch (deliveryType) {
      case "EXPRESS":
        return 40;

      case "SCHEDULED":
        return 25;

      default:
        throw createError("Invalid delivery type.");
    }
  },

  // Generate order number.
  generateOrderNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();

    return `GB-${timestamp}-${random}`;
  },

  // Get order details.
  async getOrderById(orderId, customerId) {
    if (!orderId || !customerId) {
      throw createError(
        "Order ID and customer ID are required."
      );
    }

    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw createError("Order not found.", 404);
    }

    // Customers can access only their own orders.
    if (order.customerId !== customerId) {
      throw createError(
        "You are not authorized to access this order.",
        403
      );
    }

    return order;
  },

  // Get customer orders with pagination.
  async getCustomerOrders(customerId, options = {}) {
    if (!customerId) {
      throw createError("Customer ID is required.", 401);
    }

    const { skip, take } = normalizePagination(options, 10);

    const [orders, total] = await Promise.all([
      orderRepository.findByCustomer(customerId, {
        skip,
        take,
      }),

      orderRepository.countByCustomer(customerId),
    ]);

    return {
      orders,
      pagination: {
        total,
        skip,
        take,
        hasMore: skip + orders.length < total,
      },
    };
  },

  // Get orders ready for Express assignment.
  async getReadyExpressOrders(options = {}) {
    const { skip, take } = normalizePagination(options, 20);

    return orderRepository.findReadyExpressOrders({
      skip,
      take,
    });
  },
};
