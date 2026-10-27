import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.js";
import { requireAdmin } from "@/lib/require-admin.js";

export async function GET() {
  try {
    const auth = await requireAdmin();

    if (!auth.authorized) {
      return auth.response;
    }

    const categories = await prisma.category.findMany({
      orderBy: [
        { sortOrder: "asc" },
        { name: "asc" },
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        isActive: true,
        sortOrder: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      total: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Admin categories GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch categories.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdmin();

    if (!auth.authorized) {
      return auth.response;
    }

    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : null;

    const imageUrl =
      typeof body.imageUrl === "string"
        ? body.imageUrl.trim()
        : null;

    const parentId =
      typeof body.parentId === "string" && body.parentId.trim()
        ? body.parentId.trim()
        : null;

    const isActive =
      body.isActive === undefined ? true : body.isActive;

    const sortOrder =
      body.sortOrder === undefined ? 0 : body.sortOrder;

    if (!name || name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name is required and must be at most 100 characters.",
        },
        { status: 400 }
      );
    }

    if (description && description.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          message: "Description must be at most 1000 characters.",
        },
        { status: 400 }
      );
    }

    if (imageUrl) {
      try {
        const url = new URL(imageUrl);

        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("Invalid protocol");
        }
      } catch {
        return NextResponse.json(
          {
            success: false,
            message: "Image URL must be a valid HTTP or HTTPS URL.",
          },
          { status: 400 }
        );
      }
    }

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "isActive must be a boolean.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(sortOrder) ||
      sortOrder < 0 ||
      sortOrder > 100000
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "sortOrder must be a non-negative integer.",
        },
        { status: 400 }
      );
    }

    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
        select: { id: true },
      });

      if (!parent) {
        return NextResponse.json(
          {
            success: false,
            message: "Parent category not found.",
          },
          { status: 400 }
        );
      }
    }

    const baseSlug = name
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!baseSlug) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name must contain letters or numbers for a URL slug.",
        },
        { status: 400 }
      );
    }

    const slug = parentId
      ? `${baseSlug}-${parentId}`
      : baseSlug;

    const existing = await prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "A category with this name or slug already exists.",
        },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
        isActive,
        sortOrder,
        parentId,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        isActive: true,
        sortOrder: true,
        parentId: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully.",
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message: "A category with this slug already exists.",
        },
        { status: 409 }
      );
    }

    console.error("Admin categories POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create category.",
      },
      { status: 500 }
    );
  }
}
