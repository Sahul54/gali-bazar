
"use client";

import { useCallback, useState } from "react";

export default function useCustomerLocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Your browser does not support location access.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setLocation(coordinates);
        setLoading(false);
      },
      (geoError) => {
        let message = "Unable to get your location.";

        if (geoError.code === geoError.PERMISSION_DENIED) {
          message = "Please allow location access in your browser.";
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          message = "Your current location is unavailable.";
        } else if (geoError.code === geoError.TIMEOUT) {
          message = "Location request timed out. Please try again.";
        }

        setError(message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  }, []);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
  };
}
