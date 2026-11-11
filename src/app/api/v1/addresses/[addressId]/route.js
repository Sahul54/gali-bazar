
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth.js";

import {
  getCustomerAddress,
  editCustomerAddress,
  removeCustomerAddress,
} from "@/modules/address/address.service.js";

// GET: Fetch single customer address
export async function GET(request, { params }) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const { addressId } = await params;

    const address = await getCustomerAddress(
      session.userId,
      addressId
    );

    return NextResponse.json({
      success: true,
      data: address,
    });
  } catch (error) {
    console.error("GET CUSTOMER ADDRESS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Unable to fetch address.",
      },
      {
        status: error.message === "Address not found." ? 404 : 400,
      }
    );
  }
}

// PATCH: Update customer address
export async function PATCH(request, { params }) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const { addressId } = await params;
    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const address = await editCustomerAddress(
      session.userId,
      addressId,
      body
    );

    return NextResponse.json(
      {
        success: true,
        message: "Address updated successfully.",
        data: { address },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH CUSTOMER ADDRESS ERROR:", error);

    const status =
      error.message === "Address not found."
        ? 404
        : error.details
          ? 400
          : 500;

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Unable to update address.",
        errors: error.details || undefined,
      },
      { status }
    );
  }
}

// DELETE: Remove customer address
export async function DELETE(request, { params }) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const { addressId } = await params;

    await removeCustomerAddress(session.userId, addressId);

    return NextResponse.json(
      {
        success: true,
        message: "Address deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE CUSTOMER ADDRESS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Unable to delete address.",
      },
      {
        status: error.message === "Address not found." ? 404 : 500,
      }
    );
  }
}
