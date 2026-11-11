
import {
  createSupportTicket,
  findSupportTicketsByUserId,
  findSupportTicketById,
  findCustomerOrderById,
} from "./support.repository.js";

// ============================================
// Category Mapping
// ============================================

const CATEGORY_MAP = {
  "Order Issue": "ORDER_ISSUE",
  "Payment & Refund": "PAYMENT_REFUND",
  "Delivery Issue": "DELIVERY_ISSUE",
  "Product Issue": "PRODUCT_ISSUE",
  "Account Issue": "ACCOUNT_ISSUE",
  Other: "OTHER",
};

const VALID_CATEGORIES = Object.keys(CATEGORY_MAP);

// ============================================
// Create Support Ticket
// ============================================

export async function createCustomerSupportTicket(userId, data) {
  if (!userId) {
    throw new Error("Customer authentication required.");
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Invalid request data.");
  }

  const { category, subject, message, orderId } = data;

  // Validate category
  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error("Please select a valid issue category.");
  }

  // Validate subject
  if (typeof subject !== "string" || !subject.trim()) {
    throw new Error("Subject is required.");
  }

  if (subject.trim().length > 120) {
    throw new Error("Subject cannot exceed 120 characters.");
  }

  // Validate message
  if (typeof message !== "string" || message.trim().length < 10) {
    throw new Error("Description must contain at least 10 characters.");
  }

  if (message.trim().length > 2000) {
    throw new Error("Description cannot exceed 2000 characters.");
  }

  // Validate optional order ID
  let verifiedOrderId = null;

  if (orderId !== undefined && orderId !== null && orderId !== "") {
    if (typeof orderId !== "string" || !orderId.trim()) {
      throw new Error("Invalid order ID.");
    }

    const order = await findCustomerOrderById(
      orderId.trim(),
      userId
    );

    if (!order) {
      throw new Error("Order not found or does not belong to you.");
    }

    verifiedOrderId = order.id;
  }

  return createSupportTicket({
    category: CATEGORY_MAP[category],
    subject: subject.trim(),
    message: message.trim(),
    userId,
    orderId: verifiedOrderId,
  });
}

// ============================================
// Get Customer Support Tickets
// ============================================

export async function getCustomerSupportTickets(userId) {
  if (!userId) {
    throw new Error("Customer authentication required.");
  }

  return findSupportTicketsByUserId(userId);
}

// ============================================
// Get Single Customer Support Ticket
// ============================================

export async function getCustomerSupportTicket(userId, ticketId) {
  if (!userId) {
    throw new Error("Customer authentication required.");
  }

  if (typeof ticketId !== "string" || !ticketId.trim()) {
    throw new Error("Invalid support ticket ID.");
  }

  const ticket = await findSupportTicketById(
    ticketId,
    userId
  );

  if (!ticket) {
    throw new Error("Support ticket not found.");
  }

  return ticket;
}
