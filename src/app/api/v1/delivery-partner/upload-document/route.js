
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth.js";
import { cloudinary } from "@/lib/cloudinary.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

function errorResponse(message, status) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

export async function POST(request) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return errorResponse("Please login to continue.", 401);
    }

    if (session.role !== "DELIVERY_PARTNER") {
      return errorResponse("Access denied.", 403);
    }

    const formData = await request.formData();

    const file = formData.get("file");
    const documentType = formData.get("documentType");

    if (!["LICENSE", "VEHICLE_RC"].includes(documentType)) {
      return errorResponse("Invalid document type.", 400);
    }

    if (!file || typeof file.arrayBuffer !== "function") {
      return errorResponse("Please select a document.", 400);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return errorResponse(
        "Only PDF, JPG and PNG files are allowed.",
        400
      );
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return errorResponse(
        "Document size must be between 1 byte and 5 MB.",
        400
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await uploadToCloudinary(
      buffer,
      `gali-bazar/delivery-partners/${session.userId}`
    );

    return NextResponse.json({
      success: true,
      message: "Document uploaded successfully.",
      document: {
        url: result.secure_url,
        publicId: result.public_id,
        type: documentType,
      },
    });
  } catch (error) {
    console.error("Delivery partner document upload error:", error);

    return errorResponse(
      "Unable to upload document. Please try again.",
      500
    );
  }
}
