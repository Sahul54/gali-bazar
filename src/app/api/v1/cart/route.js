
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getCustomerCart,
  clearCustomerCart,
} from "@/modules/cart/cart.service";

// ==========================================
// AUTHENTICATION HELPER
// ==========================================

async function authenticateCustomer() {
  const session = await getSession();

  if (!session) {
    return {
      error: NextResponse.json(
        { success: false, message: "Please login to continue." },
        { status: 401 }
      ),
    };
  }

  if (session.role !== "CUSTOMER") {
    return {
      error: NextResponse.json(
        { success: false, message: "Customer access only." },
        { status: 403 }
      ),
    };
  }

  return { userId: session.userId };
}

// ==========================================
// GET CUSTOMER CART
// GET /api/v1/cart
// ==========================================

export async function GET() {
  try {
    const auth = await authenticateCustomer();

    if (auth.error) return auth.error;

    const cart = await getCustomerCart(auth.userId);

    return NextResponse.json(
      {
        success: true,
        message: "Cart fetched successfully.",
        data: cart,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/v1/cart error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Unable to fetch cart.",
      },
      { status: error.statusCode || 500 }
    );
  }
}

// ==========================================
// DELETE CUSTOMER CART ITEMS
// DELETE /api/v1/cart
// ==========================================

export async function DELETE() {
  try {
    const auth = await authenticateCustomer();

    if (auth.error) return auth.error;

    const result = await clearCustomerCart(auth.userId);

    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/v1/cart error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Unable to clear cart.",
      },
      { status: error.statusCode || 500 }
    );
  }
}
