import { prisma } from "../src/lib/prisma.js";
import { passwordService } from "../src/lib/password.js";
import { adminValidation } from "../src/modules/admin/admin.validation.js";

async function createAdmin() {
  const emailValidation = adminValidation.validateEmail(
    process.env.ADMIN_BOOTSTRAP_EMAIL
  );

  if (!emailValidation.valid) {
    throw new Error(emailValidation.error);
  }

  const passwordValidation = adminValidation.validatePassword(
    process.env.ADMIN_BOOTSTRAP_PASSWORD
  );

  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.error);
  }

  const phone = process.env.ADMIN_BOOTSTRAP_PHONE;

  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    throw new Error(
      "ADMIN_BOOTSTRAP_PHONE must be a valid 10-digit Indian mobile number."
    );
  }

  const email = emailValidation.email;

  // Prevent duplicate accounts and accidental role changes.
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
    },
  });

  if (existingUser) {
    throw new Error(
      "An account with this email or phone already exists. No changes were made."
    );
  }

  const passwordHash = await passwordService.hash(
    passwordValidation.password
  );

  const admin = await prisma.user.create({
    data: {
      name: "Gali Bazar Admin",
      email,
      phone,
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  console.info("Admin account created successfully:", admin);
}

async function main() {
  try {
    await createAdmin();
  } catch (error) {
    console.error(
      "Admin provisioning failed:",
      error instanceof Error ? error.message : "Unexpected error."
    );

    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();