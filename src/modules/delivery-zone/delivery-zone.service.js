
import {
  findAllDeliveryZones,
  findDeliveryZoneById,
  findDeliveryZoneByCode,
  findDeliveryZoneByPincode,
  createDeliveryZone,
  updateDeliveryZone,
  updateDeliveryZoneStatus,
  addPincodesToZone,
  updatePincodeStatus,
  removePincodeFromZone,
  deleteDeliveryZone,
} from "./delivery-zone.repository.js";

function normalizeCode(code) {
  return code.trim().toUpperCase().replace(/\s+/g, "-");
}

function validatePincodes(pincodes) {
  if (!Array.isArray(pincodes) || pincodes.length === 0) {
    throw new Error("At least one pincode is required.");
  }

  const normalized = pincodes.map((pincode) =>
    String(pincode).trim()
  );

  if (normalized.some((pincode) => !/^[1-9]\d{5}$/.test(pincode))) {
    throw new Error("Every pincode must be a valid 6-digit Indian pincode.");
  }

  if (new Set(normalized).size !== normalized.length) {
    throw new Error("Duplicate pincodes are not allowed.");
  }

  return normalized;
}

function validateFee(value, fieldName) {
  const fee = Number(value);

  if (!Number.isFinite(fee) || fee < 0) {
    throw new Error(`${fieldName} must be a valid non-negative amount.`);
  }

  return fee;
}

// Get all delivery zones
export async function getAllDeliveryZones() {
  return findAllDeliveryZones();
}

// Get zone details
export async function getDeliveryZoneById(id) {
  if (!id) throw new Error("Delivery zone ID is required.");

  const zone = await findDeliveryZoneById(id);

  if (!zone) throw new Error("Delivery zone not found.");

  return zone;
}

// Create new delivery zone
export async function addDeliveryZone(data) {
  const name = data.name?.trim();
  const code = data.code ? normalizeCode(data.code) : "";

  if (!name) throw new Error("Zone name is required.");
  if (!code) throw new Error("Zone code is required.");

  const expressFee = validateFee(data.expressFee, "Express fee");
  const scheduledFee = validateFee(
    data.scheduledFee,
    "Scheduled fee"
  );

  const pincodes = validatePincodes(data.pincodes);

  const existingCode = await findDeliveryZoneByCode(code);

  if (existingCode) {
    throw new Error("A delivery zone with this code already exists.");
  }

  for (const pincode of pincodes) {
    const existingPincode = await findDeliveryZoneByPincode(pincode);

    if (existingPincode) {
      throw new Error(
        `Pincode ${pincode} is already assigned to another delivery zone.`
      );
    }
  }

  return createDeliveryZone({
    name,
    code,
    expressFee,
    scheduledFee,
    pincodes,
  });
}

// Update zone details
export async function editDeliveryZone(id, data) {
  const existingZone = await getDeliveryZoneById(id);

  const updateData = {};

  if (data.name !== undefined) {
    const name = data.name.trim();

    if (!name) throw new Error("Zone name cannot be empty.");

    updateData.name = name;
  }

  if (data.code !== undefined) {
    const code = normalizeCode(data.code);

    if (!code) throw new Error("Zone code cannot be empty.");

    const existingCode = await findDeliveryZoneByCode(code);

    if (existingCode && existingCode.id !== id) {
      throw new Error("This zone code is already in use.");
    }

    updateData.code = code;
  }

  if (data.expressFee !== undefined) {
    updateData.expressFee = validateFee(
      data.expressFee,
      "Express fee"
    );
  }

  if (data.scheduledFee !== undefined) {
    updateData.scheduledFee = validateFee(
      data.scheduledFee,
      "Scheduled fee"
    );
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error("No valid fields provided for update.");
  }

  return updateDeliveryZone(existingZone.id, updateData);
}

// Activate or deactivate zone
export async function changeDeliveryZoneStatus(id, isActive) {
  await getDeliveryZoneById(id);

  if (typeof isActive !== "boolean") {
    throw new Error("isActive must be true or false.");
  }

  return updateDeliveryZoneStatus(id, isActive);
}

// Add pincodes to an existing zone
export async function addZonePincodes(id, inputPincodes) {
  await getDeliveryZoneById(id);

  const pincodes = validatePincodes(inputPincodes);

  for (const pincode of pincodes) {
    const existing = await findDeliveryZoneByPincode(pincode);

    if (existing) {
      throw new Error(
        `Pincode ${pincode} is already assigned to a delivery zone.`
      );
    }
  }

  await addPincodesToZone(id, pincodes);

  return getDeliveryZoneById(id);
}

// Activate or deactivate an individual pincode
export async function changePincodeStatus(id, isActive) {
  if (typeof isActive !== "boolean") {
    throw new Error("isActive must be true or false.");
  }

  return updatePincodeStatus(id, isActive);
}

// Remove pincode
export async function deleteZonePincode(id) {
  if (!id) throw new Error("Pincode ID is required.");

  return removePincodeFromZone(id);
}

// Delete zone
export async function removeDeliveryZone(id) {
  await getDeliveryZoneById(id);

  return deleteDeliveryZone(id);
}

// Check customer delivery availability by pincode
export async function checkDeliveryAvailability(pincode) {
  const normalizedPincode = String(pincode || "").trim();

  if (!/^[1-9]\d{5}$/.test(normalizedPincode)) {
    throw new Error("Please enter a valid 6-digit pincode.");
  }

  const result = await findDeliveryZoneByPincode(normalizedPincode);

  if (
    !result ||
    !result.isActive ||
    !result.deliveryZone.isActive
  ) {
    return {
      available: false,
      message: "Sorry, delivery is not available at this pincode.",
    };
  }

  return {
    available: true,
    message: "Delivery is available at your location.",
    zone: {
      id: result.deliveryZone.id,
      name: result.deliveryZone.name,
      code: result.deliveryZone.code,
    },
    fees: {
      express: Number(result.deliveryZone.expressFee),
      scheduled: Number(result.deliveryZone.scheduledFee),
    },
  };
}
