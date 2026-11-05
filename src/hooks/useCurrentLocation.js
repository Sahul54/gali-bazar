
"use client";

import { useCallback, useEffect, useState } from "react";
import { useGeolocated } from "react-geolocated";

export function useCurrentLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState(null);

  const {
    coords,
    isGeolocationAvailable,
    positionError,
    getPosition,
  } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: false,
      maximumAge: 60000,
      timeout: 30000,
    },
    watchPosition: false,
    userDecisionTimeout: 10000,
    suppressLocationOnMount: true,
  });

  // Receive detected coordinates
  useEffect(() => {
    if (coords) {
      setLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
      });

      setLoading(false);
      setError("");
    }
  }, [coords]);

  // Handle geolocation errors
  useEffect(() => {
    if (!positionError) return;

    let message = "Unable to detect your location.";

    switch (positionError.code) {
      case 1:
        message =
          "Location permission denied. Please allow location access.";
        break;

      case 2:
        message =
          "Location information is unavailable. Check your device settings.";
        break;

      case 3:
        message =
          "Location request timed out. Please try again.";
        break;
    }

    setError(message);
    setLoading(false);
  }, [positionError]);

  // Request current location
  const detectLocation = useCallback(() => {
    setError("");
    setLocation(null);

    if (!isGeolocationAvailable) {
      setError(
        "Geolocation is not available in this browser."
      );
      return;
    }

    setLoading(true);

    getPosition();
  }, [getPosition, isGeolocationAvailable]);

  const resetLocation = useCallback(() => {
    setLocation(null);
    setError("");
    setLoading(false);
  }, []);

  return {
    location,
    loading,
    error,
    detectLocation,
    resetLocation,
    isGeolocationAvailable,
  };
}
