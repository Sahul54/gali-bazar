
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCustomerAddress } from "@/modules/address/address.service";

export async function GET(request, { params }) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
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
      { status: error.message === "Address not found." ? 404 : 400 }
    );
  }
}
