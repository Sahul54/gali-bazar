
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";

function jsonError(message, status) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function requireApprovedSellerApi() {
  try {
    // 1. Verify the signed session
    const session = await getSession();

    if (!session?.userId) {
      return {
        seller: null,
        response: jsonError(
          "Please log in to continue.",
          401
        ),
      };
    }

    // 2. Verify seller role
    if (session.role !== "SELLER") {
      return {
        seller: null,
        response: jsonError(
          "Seller access required.",
          403
        ),
      };
    }

    // 3. Verify current database status
    const user = await prisma.user.findFirst({
      where: {
        id: session.userId,
        role: "SELLER",
        isActive: true,
        sellerProfile: {
          is: {
            status: "APPROVED",
          },
        },
      },
      select: {
        id: true,
        sellerProfile: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user?.sellerProfile) {
      return {
        seller: null,
        response: jsonError(
          "An approved seller account is required.",
          403
        ),
      };
    }

    // Return only trusted database identity
    return {
      seller: {
        userId: user.id,
        sellerProfileId: user.sellerProfile.id,
      },
      response: null,
    };
  } catch (error) {
    console.error("SELLER_API_AUTH_ERROR:", error);

    return {
      seller: null,
      response: jsonError(
        "Unable to verify seller access.",
        500
      ),
    };
  }
}
