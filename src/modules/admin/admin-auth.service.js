import { adminRepository } from "./admin.repository.js";
import { adminValidation } from "./admin.validation.js";
import { passwordService } from "../../lib/password.js";

export const adminAuthService = {
  async login({ email, password }) {
    const emailValidation = adminValidation.validateEmail(email);

    if (!emailValidation.valid) {
      throw new Error(emailValidation.error);
    }

    const passwordValidation =
      adminValidation.validatePassword(password);

    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.error);
    }

    const admin = await adminRepository.findAdminByEmail(
      emailValidation.email
    );

    if (!admin || admin.role !== "ADMIN" || !admin.passwordHash) {
      throw new Error("Invalid email or password.");
    }

    if (!admin.isActive) {
      throw new Error("Your account is inactive.");
    }

    const isPasswordValid = await passwordService.verify(
      passwordValidation.password,
      admin.passwordHash
    );

    if (!isPasswordValid) {
      throw new Error("Invalid email or password.");
    }

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
    };
  },
};