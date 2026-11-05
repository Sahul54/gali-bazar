
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  updateCartItem,
  removeCartItem,
} from "@/modules/cart/cart.service";
import { updateCartItemSchema } from "@/modules/cart/cart.validation";

// ==========================================
// AUTHENTICATION HELPER
// ==========================================

async function authenticateCustomer() {
  const session = await getSession();

  if (!session) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Please login to continue.",
        },
        { status: 401 }
      ),
    };
  }

  if (session.role !== "CUSTOMER") {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Customer access only.",
        },
        { status: 403 }
      ),
    };
  }

  return { userId: session.userId };
}

// ==========================================
// PATCH - UPDATE CART ITEM QUANTITY
// PATCH /api/v1/cart/items/[itemId]
// ==========================================

export async function PATCH(request, { params }) {
  try {
    const auth = await authenticateCustomer();

    if (auth.error) return auth.error;

    const { itemId } = await params;

    const body = await request.json();

    const validation = updateCartItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid quantity.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { quantity } = validation.data;

    const cart = await updateCartItem(
      auth.userId,
      itemId,
      quantity
    );

    return NextResponse.json(
      {
        success: true,
        message: "Cart quantity updated successfully.",
        data: cart,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error(
      "PATCH /api/v1/cart/items/[itemId] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: error.statusCode
          ? error.message
          : "Unable to update cart item.",
      },
      { status: error.statusCode || 500 }
    );
  }
}

// ==========================================
// DELETE - REMOVE CART ITEM
// DELETE /api/v1/cart/items/[itemId]
// ==========================================

export async function DELETE(request, { params }) {
  try {
    const auth = await authenticateCustomer();

    if (auth.error) return auth.error;

    const { itemId } = await params;

    const cart = await removeCartItem(
      auth.userId,
      itemId
    );

    return NextResponse.json(
      {
        success: true,
        message: "Product removed from cart successfully.",
        data: cart,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error(
      "DELETE /api/v1/cart/items/[itemId] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: error.statusCode
          ? error.message
          : "Unable to remove cart item.",
      },
      { status: error.statusCode || 500 }
    );
  }
}
