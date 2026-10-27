
const ALLOWED_CATEGORIES = [
  "Grocery",
  "Fashion",
  "Electronics",
  "Home & Kitchen",
  "Beauty & Personal Care",
  "Footwear",
  "Books & Stationery",
  "Food & Bakery",
  "Other",
];

export const sellerValidation = {
  validateBusinessName(businessName) {
    if (typeof businessName !== "string" || !businessName.trim()) {
      return { valid: false, error: "Business name is required." };
    }

    const normalizedName = businessName.trim();

    if (normalizedName.length < 2) {
      return {
        valid: false,
        error: "Business name must be at least 2 characters.",
      };
    }

    if (normalizedName.length > 100) {
      return {
        valid: false,
        error: "Business name cannot exceed 100 characters.",
      };
    }

    return { valid: true, businessName: normalizedName };
  },

  validateBusinessDetails({ ownerName, category, address, pincode } = {}) {
    if (typeof ownerName !== "string" || !ownerName.trim()) {
      return { valid: false, error: "Owner name is required." };
    }

    const normalizedOwnerName = ownerName.trim();

    if (normalizedOwnerName.length < 2 || normalizedOwnerName.length > 100) {
      return {
        valid: false,
        error: "Owner name must be between 2 and 100 characters.",
      };
    }

    if (typeof category !== "string" || !ALLOWED_CATEGORIES.includes(category.trim())) {
      return {
        valid: false,
        error: "Please select a valid business category.",
      };
    }

    if (typeof address !== "string" || !address.trim()) {
      return { valid: false, error: "Business address is required." };
    }

    const normalizedAddress = address.trim();

    if (normalizedAddress.length < 10 || normalizedAddress.length > 300) {
      return {
        valid: false,
        error: "Address must be between 10 and 300 characters.",
      };
    }

    const normalizedPincode =
      typeof pincode === "string" ? pincode.trim() : "";

    if (!/^[1-9][0-9]{5}$/.test(normalizedPincode)) {
      return {
        valid: false,
        error: "Enter a valid 6-digit Indian PIN code.",
      };
    }

    return {
      valid: true,
      details: {
        ownerName: normalizedOwnerName,
        category: category.trim(),
        address: normalizedAddress,
        pincode: normalizedPincode,
      },
    };
  },
};
