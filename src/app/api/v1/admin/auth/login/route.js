import { NextResponse } from "next/server";
import { adminAuthService } from "@/modules/admin/admin-auth.service.js";
import { createSession } from "@/lib/auth.js";

export async function POST(request) {
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
    typeof body.email !== "string" ||
    typeof body.password !== "string"
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Email and password are required.",
      },
      { status: 400 }
    );
  }

  try {
    const admin = await adminAuthService.login({
      email: body.email,
      password: body.password,
    });

    await createSession(admin);

    return NextResponse.json({
      success: true,
      message: "Admin login successful.",
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "";

    const validationErrors = [
      "Email is required.",
      "Please enter a valid email address.",
      "Password is required.",
      "Password must be at least 12 characters long.",
      "Password cannot exceed 128 characters.",
    ];

    if (validationErrors.includes(message)) {
      return NextResponse.json(
        { success: false, message },
        { status: 400 }
      );
    }

    if (
      message === "Invalid email or password." ||
      message === "Your account is inactive."
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    console.error("Admin login failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}