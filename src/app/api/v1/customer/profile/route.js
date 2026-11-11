
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";

// ==========================================
// GET: Customer Profile & Dashboard Details
// ==========================================

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { success: false, message: "Please login first." },
        { status: 401 }
      );
    }

    const userId = session.userId;

    const [
      user,
      totalOrders,
      activeOrders,
      deliveredOrders,
      cancelledOrders,
      spending,
      recentOrders,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,

          addresses: {
            orderBy: { createdAt: "desc" },
          },

          cart: {
            select: {
              items: {
                select: {
                  id: true,
                  quantity: true,
                },
              },
            },
          },

          productViews: {
            orderBy: { viewedAt: "desc" },
            take: 5,
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: {
                    orderBy: { sortOrder: "asc" },
                    take: 1,
                    select: {
                      imageUrl: true,
                      altText: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),

      prisma.order.count({
        where: { customerId: userId },
      }),

      prisma.order.count({
        where: {
          customerId: userId,
          status: {
            in: [
              "PLACED",
              "CONFIRMED",
              "PREPARING",
              "READY_FOR_PICKUP",
              "ASSIGNED",
              "PICKED_UP",
              "OUT_FOR_DELIVERY",
            ],
          },
        },
      }),

      prisma.order.count({
        where: {
          customerId: userId,
          status: "DELIVERED",
        },
      }),

      prisma.order.count({
        where: {
          customerId: userId,
          status: "CANCELLED",
        },
      }),

      prisma.order.aggregate({
        where: {
          customerId: userId,
          status: "DELIVERED",
        },
        _sum: {
          totalAmount: true,
        },
      }),

      prisma.order.findMany({
        where: { customerId: userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentMethod: true,
          paymentStatus: true,
          subtotal: true,
          deliveryFee: true,
          totalAmount: true,
          deliveryType: true,
          deliveryAddress: true,
          deliveryName: true,
          deliveryPhone: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              productName: true,
              variantTitle: true,
              quantity: true,
              unitPrice: true,
              lineTotal: true,
            },
          },
        },
      }),
    ]);

    if (!user || !user.isActive || user.role !== "CUSTOMER") {
      return NextResponse.json(
        { success: false, message: "Customer account not found." },
        { status: 404 }
      );
    }

    const profile = {
      ...user,

      addresses: user.addresses,

      cartCount:
        user.cart?.items?.reduce(
          (total, item) => total + item.quantity,
          0
        ) || 0,

      recentProducts: user.productViews.map((view) => ({
        ...view.product,
        viewedAt: view.viewedAt,
      })),
    };

    return NextResponse.json({
      success: true,
      data: {
        user: profile,

        stats: {
          totalOrders,
          activeOrders,
          deliveredOrders,
          cancelledOrders,
          totalSpent: Number(spending._sum.totalAmount || 0),
          savedAddresses: user.addresses.length,
          cartItems: profile.cartCount,
        },

        recentOrders: recentOrders.map((order) => ({
          ...order,
          subtotal: Number(order.subtotal),
          deliveryFee: Number(order.deliveryFee),
          totalAmount: Number(order.totalAmount),
          items: order.items.map((item) => ({
            ...item,
            unitPrice: Number(item.unitPrice),
            lineTotal: Number(item.lineTotal),
          })),
        })),
      },
    });
  } catch (error) {
    console.error("Customer profile API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load customer account.",
      },
      { status: 500 }
    );
  }
}

// ==========================================
// PATCH: Update Customer Profile
// ==========================================

export async function PATCH(request) {
  try {
    // 1. Authentication
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    // 2. Verify customer account
    const existingUser = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        id: true,
        role: true,
        isActive: true,
      },
    });

    if (
      !existingUser ||
      !existingUser.isActive ||
      existingUser.role !== "CUSTOMER"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer account not found.",
        },
        { status: 404 }
      );
    }

    // 3. Parse request body
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

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid profile information.",
        },
        { status: 400 }
      );
    }

    const allowedFields = ["name", "email"];
    const submittedFields = Object.keys(body);

    if (
      submittedFields.length === 0 ||
      submittedFields.some(
        (field) => !allowedFields.includes(field)
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide valid profile information.",
        },
        { status: 400 }
      );
    }

    // 4. Validate profile fields
    const updateData = {};

    if (Object.prototype.hasOwnProperty.call(body, "name")) {
      if (
        typeof body.name !== "string" ||
        !body.name.trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Name is required.",
          },
          { status: 400 }
        );
      }

      const name = body.name.trim();

      if (name.length < 2 || name.length > 100) {
        return NextResponse.json(
          {
            success: false,
            message: "Name must be between 2 and 100 characters.",
          },
          { status: 400 }
        );
      }

      updateData.name = name;
    }

    if (Object.prototype.hasOwnProperty.call(body, "email")) {
      if (typeof body.email !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid email address.",
          },
          { status: 400 }
        );
      }

      const email = body.email.trim().toLowerCase();

      if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Please enter a valid email address.",
          },
          { status: 400 }
        );
      }

      updateData.email = email || null;

      // 5. Check duplicate email
      if (email) {
        const emailExists = await prisma.user.findFirst({
          where: {
            email,
            NOT: {
              id: session.userId,
            },
          },
          select: {
            id: true,
          },
        });

        if (emailExists) {
          return NextResponse.json(
            {
              success: false,
              message: "This email is already registered.",
            },
            { status: 409 }
          );
        }
      }
    }

    // 6. Update authenticated customer's profile
    const updatedUser = await prisma.user.update({
      where: {
        id: session.userId,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 7. Success response
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error("Customer profile update API error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message: "This email is already registered.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update customer profile.",
      },
      { status: 500 }
    );
  }
}
