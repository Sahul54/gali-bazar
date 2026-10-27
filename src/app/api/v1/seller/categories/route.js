import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";


export async function GET() {
  try {
    // 1. Check seller session
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { success: false, message: "Please log in to continue." },
        { status: 401 }
      );
    }

    if (session.role !== "SELLER") {
      return NextResponse.json(
        { success: false, message: "Seller access required." },
        { status: 403 }
      );
    }

    // 2. Verify seller is active and approved
    const seller = await prisma.user.findFirst({
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
      },
    });

    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Approved seller account required." },
        { status: 403 }
      );
    }

    // 3. Fetch active categories and subcategories
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { sortOrder: "asc" },
        { name: "asc" },
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        parentId: true,
      },
    });

    // 4. Build category hierarchy
    const categoryMap = new Map();

    for (const category of categories) {
      categoryMap.set(category.id, {
        ...category,
        children: [],
      });
    }

    const rootCategories = [];

    for (const category of categories) {
      const current = categoryMap.get(category.id);

      if (category.parentId && categoryMap.has(category.parentId)) {
        categoryMap.get(category.parentId).children.push(current);
      } else if (!category.parentId) {
        rootCategories.push(current);
      }
    }

    return NextResponse.json(
      {
        success: true,
        categories: rootCategories,
        total: categories.length,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error("Seller categories API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load categories.",
      },
      { status: 500 }
    );
  }
}