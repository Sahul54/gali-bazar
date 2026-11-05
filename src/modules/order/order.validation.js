
import {
  DELIVERY_TYPE,
  VALID_DELIVERY_TYPES,
} from "./order.constants.js";

const isValidString = (value, min = 1, max = 500) => {
  return (
    typeof value === "string" &&
    value.trim().length >= min &&
    value.trim().length <= max
  );
};

const isValidCoordinate = (value, min, max) => {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
  );
};

const isValidDate = (value) => {
  if (!value) return false;

  const date = new Date(value);

  return (
    !Number.isNaN(date.getTime()) &&
    date.getTime() > Date.now()
  );
};

export function validateCreateOrder(data) {
  const errors = [];

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {
      valid: false,
      errors: ["Invalid order data."],
    };
  }

  // 1. Delivery type
  const deliveryType =
    data.deliveryType || DELIVERY_TYPE.EXPRESS;

  if (!VALID_DELIVERY_TYPES.includes(deliveryType)) {
    errors.push("Invalid delivery type.");
  }

  // 2. Delivery address
  if (!isValidString(data.deliveryAddress, 5, 500)) {
    errors.push("Valid delivery address is required.");
  }

  // 3. Delivery coordinates
  if (
    !isValidCoordinate(data.deliveryLatitude, -90, 90)
  ) {
    errors.push("Valid delivery latitude is required.");
  }

  if (
    !isValidCoordinate(data.deliveryLongitude, -180, 180)
  ) {
    errors.push("Valid delivery longitude is required.");
  }

  // 4. Scheduled delivery validation
  if (deliveryType === DELIVERY_TYPE.SCHEDULED) {
    if (!isValidDate(data.scheduledDate)) {
      errors.push(
        "Scheduled delivery date must be in the future."
      );
    }

    if (!isValidString(data.scheduledSlot, 3, 50)) {
      errors.push(
        "Valid scheduled delivery slot is required."
      );
    }
  }

  // 5. Express orders cannot contain scheduled details
  if (deliveryType === DELIVERY_TYPE.EXPRESS) {
    if (data.scheduledDate || data.scheduledSlot) {
      errors.push(
        "Express orders cannot have scheduled delivery details."
      );
    }
  }

  // 6. Order items validation
  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.push("At least one order item is required.");
  } else {
    if (data.items.length > 50) {
      errors.push("Maximum 50 different order items are allowed.");
    }

    data.items.forEach((item, index) => {
      if (!item || typeof item !== "object") {
        errors.push(`Invalid item at position ${index + 1}.`);
        return;
      }

      if (!isValidString(item.variantId, 1, 100)) {
        errors.push(
          `Valid variant ID is required for item ${index + 1}.`
        );
      }

      if (
        !Number.isSafeInteger(item.quantity) ||
        item.quantity <= 0 ||
        item.quantity > 1000
      ) {
        errors.push(
          `Quantity for item ${index + 1} must be between 1 and 1000.`
        );
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
