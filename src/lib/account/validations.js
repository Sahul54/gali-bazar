
const PHONE_REGEX = /^[6-9]\d{9}$/;
const PINCODE_REGEX = /^\d{6}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ADDRESS_LABELS = ["HOME", "WORK", "OTHER"];

export function validateProfile(data = {}) {
  const errors = {};

  const name = data.name?.trim() || "";
  const email = data.email?.trim() || "";

  // Name validation
  if (!name) {
    errors.name = "Name is required";
  } else if (name.length < 2) {
    errors.name = "Name must be at least 2 characters";
  } else if (name.length > 100) {
    errors.name = "Name cannot exceed 100 characters";
  }

  // Email validation
  if (email && !EMAIL_REGEX.test(email)) {
    errors.email = "Please enter a valid email address";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateAddress(data = {}) {
  const errors = {};

  const requiredFields = [
    "fullName",
    "phone",
    "address",
    "city",
    "state",
    "pincode",
  ];

  // Required field validation
  requiredFields.forEach((field) => {
    if (!String(data[field] ?? "").trim()) {
      errors[field] = "This field is required";
    }
  });

  const fullName = data.fullName?.trim() || "";
  const phone = data.phone?.trim() || "";
  const pincode = data.pincode?.trim() || "";
  const label = data.label?.trim().toUpperCase() || "";

  // Name validation
  if (fullName && fullName.length < 2) {
    errors.fullName = "Name must be at least 2 characters";
  }

  // Phone validation
  if (phone && !PHONE_REGEX.test(phone)) {
    errors.phone = "Enter a valid 10-digit mobile number";
  }

  // Pincode validation
  if (pincode && !PINCODE_REGEX.test(pincode)) {
    errors.pincode = "Enter a valid 6-digit pincode";
  }

  // Address label validation
  if (label && !ADDRESS_LABELS.includes(label)) {
    errors.label = "Select a valid address type";
  }

  // Landmark validation
  if (data.landmark && data.landmark.trim().length > 150) {
    errors.landmark = "Landmark cannot exceed 150 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
