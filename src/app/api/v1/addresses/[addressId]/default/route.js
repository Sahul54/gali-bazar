import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth.js";
import { makeDefaultAddress } from "@/modules/address/address.service.js";

// POST: Set an address as default
export async function POST(request, { params }) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const { addressId } = await params;

    const address = await makeDefaultAddress(session.userId, addressId);

    if (!address) {
      return NextResponse.json(
        { success: false, message: "Address not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Default address updated successfully.",
        data: { address },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "POST /api/v1/addresses/[addressId]/default error:",
      error
    );

    return NextResponse.json(
      { success: false, message: "Unable to update default address." },
      { status: 500 }
    );
  }
}