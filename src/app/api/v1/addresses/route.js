
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth.js";

import {
  getCustomerAddresses,
  addCustomerAddress,
} from "@/modules/address/address.service.js";

// GET: Fetch logged-in customer's addresses
export async function GET() {
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

    const addresses = await getCustomerAddresses(session.userId);

    return NextResponse.json(
      {
        success: true,
        message: "Addresses fetched successfully.",
        data: {
          addresses,
          count: addresses.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/v1/addresses error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch addresses.",
      },
      { status: 500 }
    );
  }
}

// POST: Create a new customer address
export async function POST(request) {
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

    const address = await addCustomerAddress(
      session.userId,
      body
    );

    return NextResponse.json(
      {
        success: true,
        message: "Address created successfully.",
        data: { address },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/v1/addresses error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Unable to create address.",
        errors: error.details || undefined,
      },
      {
        status: error.details ? 400 : 500,
      }
    );
  }
}
