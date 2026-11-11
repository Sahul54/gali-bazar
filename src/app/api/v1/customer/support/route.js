
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth.js";

import {
  createCustomerSupportTicket,
  getCustomerSupportTickets,
} from "@/modules/support/support.service.js";

// ============================================
// GET - Customer Support Tickets
// ============================================

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to view your support requests.",
        },
        { status: 401 }
      );
    }

    const tickets = await getCustomerSupportTickets(
      session.userId
    );

    return NextResponse.json({
      success: true,
      message: "Support requests fetched successfully.",
      data: {
        tickets,
        count: tickets.length,
      },
    });
  } catch (error) {
    console.error("GET CUSTOMER SUPPORT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch support requests.",
      },
      { status: 500 }
    );
  }
}

// ============================================
// POST - Create Support Ticket
// ============================================

export async function POST(request) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to submit a support request.",
        },
        { status: 401 }
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const ticket = await createCustomerSupportTicket(
      session.userId,
      body
    );

    return NextResponse.json(
      {
        success: true,
        message: "Support request submitted successfully.",
        data: {
          ticket,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE CUSTOMER SUPPORT ERROR:", error);

    // Known service validation errors
    const validationErrors = [
      "Please select a valid issue category.",
      "Subject is required.",
      "Subject cannot exceed 120 characters.",
      "Description must contain at least 10 characters.",
      "Description cannot exceed 2000 characters.",
      "Invalid order ID.",
      "Order not found or does not belong to you.",
      "Invalid request data.",
    ];

    if (validationErrors.includes(error.message)) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to submit support request. Please try again.",
      },
      { status: 500 }
    );
  }
}
