
import { prisma } from "@/lib/prisma.js";

// ============================================
// Create Support Ticket
// ============================================

export async function createSupportTicket(data) {
  return prisma.supportTicket.create({
    data: {
      category: data.category,
      subject: data.subject,
      message: data.message,
      userId: data.userId,
      orderId: data.orderId || null,
    },
  });
}

// ============================================
// Get Customer Support Tickets
// ============================================

export async function findSupportTicketsByUserId(userId) {
  return prisma.supportTicket.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      category: true,
      subject: true,
      message: true,
      status: true,
      orderId: true,
      createdAt: true,
      updatedAt: true,
      order: {
        select: {
          orderNumber: true,
        },
      },
    },
  });
}

// ============================================
// Get Single Support Ticket
// ============================================

export async function findSupportTicketById(id, userId) {
  return prisma.supportTicket.findFirst({
    where: {
      id,
      userId,
    },
    select: {
      id: true,
      category: true,
      subject: true,
      message: true,
      status: true,
      orderId: true,
      createdAt: true,
      updatedAt: true,
      order: {
        select: {
          orderNumber: true,
        },
      },
    },
  });
}

// ============================================
// Verify Customer Order Ownership
// ============================================

export async function findCustomerOrderById(orderId, userId) {
  return prisma.order.findFirst({
    where: {
      id: orderId,
      customerId: userId,
    },
    select: {
      id: true,
      orderNumber: true,
    },
  });
}
