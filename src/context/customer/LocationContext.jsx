"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

const LocationContext = createContext(null);

const STORAGE_KEY = "gali-bazar-selected-location";

export function LocationProvider({ children }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [deliveryCheck, setDeliveryCheck] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [error, setError] = useState(null);

  // Restore browsing location.
  useEffect(() => {
    try {
      const savedLocation = localStorage.getItem(STORAGE_KEY);

      if (savedLocation) {
        const parsed = JSON.parse(savedLocation);

        if (
          Number.isFinite(parsed?.latitude) &&
          Number.isFinite(parsed?.longitude)
        ) {
          setSelectedLocation(parsed);
          setDeliveryCheck(parsed.deliveryCheck || null);
        }
      }
    } catch (err) {
      console.error("LOCATION RESTORE ERROR:", err);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Verify pincode delivery availability.
  const verifyPincode = useCallback(async (pincode) => {
    const normalizedPincode = String(pincode || "").trim();

    if (!/^[1-9][0-9]{5}$/.test(normalizedPincode)) {
      throw new Error("Please enter a valid 6-digit pincode.");
    }

    const response = await fetch("/api/v1/delivery/check", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pincode: normalizedPincode }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Unable to verify delivery location."
      );
    }

    if (!result.data?.available) {
      throw new Error(
        result.data?.message || "Delivery is not available at this location."
      );
    }

    return result.data;
  }, []);

  // Save selected browsing location.
  const saveLocation = useCallback((location, check) => {
    const normalizedLocation = {
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
      pincode: String(location.pincode),
      city: location.city || "",
      area: location.area || "",
      label: location.label || "Selected location",
      source: location.source || "MANUAL",
      deliveryCheck: check,
    };

    setSelectedLocation(normalizedLocation);
    setDeliveryCheck(check);
    setError(null);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(normalizedLocation)
    );
  }, []);

  // Select a location manually.
  const selectLocation = useCallback(
    async (location) => {
      try {
        setIsChecking(true);
        setError(null);

        const latitude = Number(location?.latitude);
        const longitude = Number(location?.longitude);

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude) ||
          latitude < -90 ||
          latitude > 90 ||
          longitude < -180 ||
          longitude > 180
        ) {
          throw new Error("Please select a valid location.");
        }

        const check = await verifyPincode(location.pincode);

        saveLocation(
          {
            ...location,
            latitude,
            longitude,
            source: "MANUAL",
          },
          check
        );

        return true;
      } catch (err) {
        setError(err.message || "Unable to select location.");
        return false;
      } finally {
        setIsChecking(false);
      }
    },
    [verifyPincode, saveLocation]
  );

  // Detect current GPS location.
  const detectCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Location detection is not supported by your browser.");
      return false;
    }

    try {
      setIsChecking(true);
      setError(null);

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        });
      });

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      // Reverse geocode coordinates to get area and pincode.
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to identify your current area.");
      }

      const data = await response.json();
      const address = data.address || {};

      const pincode = address.postcode?.replace(/\s/g, "");

      if (!pincode) {
        throw new Error("Pincode not found for your current location.");
      }

      const check = await verifyPincode(pincode);

      saveLocation(
        {
          latitude,
          longitude,
          pincode,
          city:
            address.city ||
            address.town ||
            address.village ||
            address.county ||
            "",
          area:
            address.suburb ||
            address.neighbourhood ||
            address.residential ||
            address.road ||
            "",
          label: "Current location",
          source: "GPS",
        },
        check
      );

      return true;
    } catch (err) {
      const message =
        err.code === 1
          ? "Location permission denied. Please allow location access."
          : err.code === 3
            ? "Location request timed out. Please try again."
            : err.message || "Unable to detect your location.";

      setError(message);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [verifyPincode, saveLocation]);

  // Clear browsing location.
  const clearLocation = useCallback(() => {
    setSelectedLocation(null);
    setDeliveryCheck(null);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = {
    selectedLocation,
    deliveryCheck,
    isChecking,
    isHydrated,
    error,
    selectLocation,
    detectCurrentLocation,
    clearLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error(
      "useLocationContext must be used inside LocationProvider."
    );
  }

  return context;
}