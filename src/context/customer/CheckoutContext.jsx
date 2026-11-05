
"use client";

import {
  createContext,
  useContext,
  useState,
} from "react";

const CheckoutContext = createContext(null);

export function CheckoutProvider({ children }) {
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [deliveryType, setDeliveryType] = useState("EXPRESS");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledSlot, setScheduledSlot] = useState("");

  function resetCheckout() {
    setSelectedAddressId("");
    setDeliveryType("EXPRESS");
    setScheduledDate("");
    setScheduledSlot("");
  }

  const value = {
    selectedAddressId,
    setSelectedAddressId,
    deliveryType,
    setDeliveryType,
    scheduledDate,
    setScheduledDate,
    scheduledSlot,
    setScheduledSlot,
    resetCheckout,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckoutContext() {
  const context = useContext(CheckoutContext);

  if (!context) {
    throw new Error(
      "useCheckoutContext must be used inside CheckoutProvider."
    );
  }

  return context;
}
