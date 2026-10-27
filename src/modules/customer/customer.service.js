
import { customerRepository } from "./customer.repository.js";

export const customerService = {
  async getProfile(userId) {
    if (!userId || typeof userId !== "string") {
      throw new Error("Valid customer ID is required.");
    }

    const customer = await customerRepository.findCustomerById(userId);

    if (!customer) {
      throw new Error("Customer not found.");
    }

    if (!customer.isActive) {
      throw new Error("Customer account is inactive.");
    }

    if (customer.role !== "CUSTOMER") {
      throw new Error("Customer access is not allowed.");
    }

    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      role: customer.role,
      createdAt: customer.createdAt,
    };
  },

  async updateProfile(userId, { name }) {
    if (!userId || typeof userId !== "string") {
      throw new Error("Valid customer ID is required.");
    }

    if (typeof name !== "string" || !name.trim()) {
      throw new Error("Customer name is required.");
    }

    const normalizedName = name.trim();

    if (normalizedName.length > 80) {
      throw new Error("Customer name cannot exceed 80 characters.");
    }

    const customer = await customerRepository.findCustomerById(userId);

    if (!customer || customer.role !== "CUSTOMER") {
      throw new Error("Customer not found.");
    }

    if (!customer.isActive) {
      throw new Error("Customer account is inactive.");
    }

    const updatedCustomer = await customerRepository.updateCustomerName(
      userId,
      normalizedName
    );

    return {
      id: updatedCustomer.id,
      name: updatedCustomer.name,
      phone: updatedCustomer.phone,
      role: updatedCustomer.role,
    };
  },
};
