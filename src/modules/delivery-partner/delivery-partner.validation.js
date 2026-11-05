const ALLOWED_VEHICLE_TYPES = [
  "BIKE",
  "SCOOTER",
  "MOTORCYCLE",
  "BICYCLE",
  "THREE_WHEELER",
  "OTHER",
];

const isValidDocumentUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return false;
  }

  try {
    const url = new URL(value.trim());

    return url.protocol === "https:";
  } catch {
    return false;
  }
};

// Shared validation for registration and reapplication.
const validatePartnerDetails = ({
  fullName,
  vehicleType,
  vehicleNumber,
  vehicleModel,
  licenseNumber,
  licenseDocumentUrl,
  vehicleDocumentUrl,
} = {}) => {
  // Full name
  if (typeof fullName !== "string" || !fullName.trim()) {
    return { valid: false, error: "Full name is required." };
  }

  const normalizedName = fullName.trim();

  if (normalizedName.length < 2 || normalizedName.length > 100) {
    return {
      valid: false,
      error: "Full name must be between 2 and 100 characters.",
    };
  }

  // Vehicle type
  if (
    typeof vehicleType !== "string" ||
    !ALLOWED_VEHICLE_TYPES.includes(vehicleType.trim().toUpperCase())
  ) {
    return {
      valid: false,
      error: "Please select a valid vehicle type.",
    };
  }

  // Vehicle number
  if (typeof vehicleNumber !== "string" || !vehicleNumber.trim()) {
    return {
      valid: false,
      error: "Vehicle number is required.",
    };
  }

  const normalizedVehicleNumber = vehicleNumber
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

  if (
    normalizedVehicleNumber.length < 4 ||
    normalizedVehicleNumber.length > 30
  ) {
    return {
      valid: false,
      error: "Vehicle number must be between 4 and 30 characters.",
    };
  }

  // Vehicle model (optional)
  if (
    vehicleModel != null &&
    (typeof vehicleModel !== "string" ||
      vehicleModel.trim().length > 100)
  ) {
    return {
      valid: false,
      error: "Vehicle model cannot exceed 100 characters.",
    };
  }

  // Driving license number
  if (typeof licenseNumber !== "string" || !licenseNumber.trim()) {
    return {
      valid: false,
      error: "Driving license number is required.",
    };
  }

  const normalizedLicenseNumber = licenseNumber
    .trim()
    .toUpperCase();

  if (
    normalizedLicenseNumber.length < 5 ||
    normalizedLicenseNumber.length > 50
  ) {
    return {
      valid: false,
      error: "Please enter a valid driving license number.",
    };
  }

  // Driving license document
  if (!isValidDocumentUrl(licenseDocumentUrl)) {
    return {
      valid: false,
      error: "Please upload a valid driving license document.",
    };
  }

  // Vehicle RC document
  if (!isValidDocumentUrl(vehicleDocumentUrl)) {
    return {
      valid: false,
      error: "Please upload a valid vehicle RC document.",
    };
  }

  return {
    valid: true,
    details: {
      fullName: normalizedName,
      vehicleType: vehicleType.trim().toUpperCase(),
      vehicleNumber: normalizedVehicleNumber,
      vehicleModel: vehicleModel?.trim() || null,
      licenseNumber: normalizedLicenseNumber,
      licenseDocumentUrl: licenseDocumentUrl.trim(),
      vehicleDocumentUrl: vehicleDocumentUrl.trim(),
    },
  };
};

export const deliveryPartnerValidation = {
  // First-time registration validation.
  validateRegistration(data = {}) {
    return validatePartnerDetails(data);
  },

  // Reapplication validation.
  validateReapplication(data = {}) {
    return validatePartnerDetails(data);
  },
};