
import {
  findAddressesByUserId,
  findAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "./address.repository.js";

const ALLOWED_LABELS = ["HOME", "WORK", "OTHER"];

function validateAddress(data) {
  const errors = {};

  if (!data.fullName?.trim()) {
    errors.fullName = "Full name is required.";
  }

  if (!data.phone?.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^[6-9]\d{9}$/.test(data.phone.trim())) {
    errors.phone = "Enter a valid 10-digit Indian phone number.";
  }

  if (!data.address?.trim()) {
    errors.address = "Full address is required.";
  }

  if (!data.city?.trim()) {
    errors.city = "City is required.";
  }

  if (!data.state?.trim()) {
    errors.state = "State is required.";
  }

  if (!data.pincode?.trim()) {
    errors.pincode = "Pincode is required.";
  } else if (!/^\d{6}$/.test(data.pincode.trim())) {
    errors.pincode = "Enter a valid 6-digit pincode.";
  }

  if (
    data.label !== undefined &&
    !ALLOWED_LABELS.includes(data.label)
  ) {
    errors.label = "Label must be HOME, WORK or OTHER.";
  }

  for (const field of ["latitude", "longitude"]) {
    if (
      data[field] !== undefined &&
      data[field] !== null &&
      !Number.isFinite(Number(data[field]))
    ) {
      errors[field] = `Invalid ${field}.`;
    }
  }

  return errors;
}

function sanitizeAddress(data) {
  return {
    fullName: data.fullName.trim(),
    phone: data.phone.trim(),
    address: data.address.trim(),
    landmark: data.landmark?.trim() || null,
    city: data.city.trim(),
    state: data.state.trim(),
    pincode: data.pincode.trim(),
    latitude:
      data.latitude !== undefined && data.latitude !== null
        ? Number(data.latitude)
        : null,
    longitude:
      data.longitude !== undefined && data.longitude !== null
        ? Number(data.longitude)
        : null,
    label: data.label || "HOME",
  };
}

// Get all customer addresses
export async function getCustomerAddresses(userId) {
  if (!userId) {
    throw new Error("User authentication is required.");
  }

  return findAddressesByUserId(userId);
}

// Get a single customer address
export async function getCustomerAddress(userId, addressId) {
  if (!userId || !addressId) {
    throw new Error("User ID and address ID are required.");
  }

  const address = await findAddressById(addressId, userId);

  if (!address) {
    throw new Error("Address not found.");
  }

  return address;
}

// Create customer address
export async function addCustomerAddress(userId, data) {
  if (!userId) {
    throw new Error("User authentication is required.");
  }

  const errors = validateAddress(data);

  if (Object.keys(errors).length > 0) {
    const error = new Error("Please enter valid address details.");
    error.details = errors;
    throw error;
  }

  const existingAddresses = await findAddressesByUserId(userId);

  const isDefault =
    data.isDefault === true || existingAddresses.length === 0;

  return createAddress({
    ...sanitizeAddress(data),
    userId,
    isDefault,
  });
}

// Update customer address
export async function editCustomerAddress(userId, addressId, data) {
  if (!userId || !addressId) {
    throw new Error("User ID and address ID are required.");
  }

  const existingAddress = await findAddressById(addressId, userId);

  if (!existingAddress) {
    throw new Error("Address not found.");
  }

  const allowedFields = [
    "fullName",
    "phone",
    "address",
    "landmark",
    "city",
    "state",
    "pincode",
    "latitude",
    "longitude",
    "label",
  ];

  const updateData = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  const mergedData = {
    ...existingAddress,
    ...updateData,
  };

  const errors = validateAddress(mergedData);

  if (Object.keys(errors).length > 0) {
    const error = new Error("Please enter valid address details.");
    error.details = errors;
    throw error;
  }

  return updateAddress(
    addressId,
    userId,
    sanitizeAddress(mergedData)
  );
}

// Delete customer address
export async function removeCustomerAddress(userId, addressId) {
  if (!userId || !addressId) {
    throw new Error("User ID and address ID are required.");
  }

  const address = await findAddressById(addressId, userId);

  if (!address) {
    throw new Error("Address not found.");
  }

  const deleted = await deleteAddress(addressId, userId);

  if (!deleted) {
    throw new Error("Unable to delete address.");
  }

  // Promote another address if the default was deleted
  if (address.isDefault) {
    const remainingAddresses = await findAddressesByUserId(userId);

    if (remainingAddresses.length > 0) {
      await setDefaultAddress(
        remainingAddresses[0].id,
        userId
      );
    }
  }

  return { success: true };
}

// Set default customer address
export async function makeDefaultAddress(userId, addressId) {
  if (!userId || !addressId) {
    throw new Error("User ID and address ID are required.");
  }

  const address = await setDefaultAddress(addressId, userId);

  if (!address) {
    throw new Error("Address not found.");
  }

  return address;
}
