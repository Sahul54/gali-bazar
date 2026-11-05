
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth.js";
import { orderService } from "@/modules/order/order.service.js";

// Standard error response
function handleError(error) {
  console.error("[ORDER API ERROR]:", error);

  return NextResponse.json(
    {
      success: false,
      message: error.message || "Something went wrong.",
    },
    {
      status: error.statusCode || 500,
    }
  );
}

// POST /api/v1/orders
// Create a new customer order.
export async function POST(request) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to place an order.",
        },
        { status: 401 }
      );
    }

    if (session.role !== "CUSTOMER") {
      return NextResponse.json(
        {
          success: false,
          message: "Only customers can place orders.",
        },
        { status: 403 }
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

    const order = await orderService.createOrder(
      session.userId,
      body
    );

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully.",
        data: order,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}

// GET /api/v1/orders
// Get logged-in customer's orders.
export async function GET(request) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to view your orders.",
        },
        { status: 401 }
      );
    }

    if (session.role !== "CUSTOMER") {
      return NextResponse.json(
        {
          success: false,
          message: "Only customers can access this endpoint.",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    const skip = Number(searchParams.get("skip") || 0);
    const take = Number(searchParams.get("take") || 10);

    const result = await orderService.getCustomerOrders(
      session.userId,
      { skip, take }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Orders fetched successfully.",
        data: result.orders,
        pagination: result.pagination,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
