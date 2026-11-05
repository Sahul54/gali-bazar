
"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  Plus,
  Loader2,
  Navigation,
} from "lucide-react";

import AddressCard from "./AddressCard";
import AddressForm from "./AddressForm";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";

const EMPTY_ADDRESS = {
  fullName: "",
  phone: "",
  address: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  label: "HOME",
};

export default function AddressSection({
  selectedAddressId,
  onAddressSelect,
}) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [initialValues, setInitialValues] =
    useState(EMPTY_ADDRESS);

  const [error, setError] = useState("");
  const [locationError, setLocationError] = useState("");
  const [resolvingAddress, setResolvingAddress] =
    useState(false);

  const {
    location,
    loading: detectingLocation,
    error: hookError,
    detectLocation,
    isGeolocationAvailable,
  } = useCurrentLocation();

  // ============================================
  // Fetch saved addresses
  // ============================================
  useEffect(() => {
    let mounted = true;

    async function fetchAddresses() {
      try {
        const response = await fetch("/api/v1/addresses");

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Unable to fetch addresses."
          );
        }

        if (!mounted) return;

        const addressList = result.data?.addresses || [];

        setAddresses(addressList);

        const defaultAddress = addressList.find(
          (address) => address.isDefault
        );

        const initialAddress =
          defaultAddress || addressList[0];

        if (initialAddress) {
          onAddressSelect(initialAddress.id);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchAddresses();

    return () => {
      mounted = false;
    };
  }, [onAddressSelect]);

  // ============================================
  // Reverse geocoding
  // ============================================
  async function getAddressFromCoordinates(
    latitude,
    longitude
  ) {
    const url = new URL(
      "https://nominatim.openstreetmap.org/reverse"
    );

    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", latitude);
    url.searchParams.set("lon", longitude);
    url.searchParams.set("addressdetails", "1");

    const response = await fetch(url.toString(), {
      headers: {
        "Accept-Language": "en",
      },
    });

    if (!response.ok) {
      throw new Error(
        "Location detected, but address could not be fetched."
      );
    }

    const result = await response.json();
    const address = result.address || {};

    const city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.county ||
      "";

    const completeAddress = [
      address.house_number,
      address.road,
      address.neighbourhood,
      address.suburb,
    ]
      .filter(Boolean)
      .join(", ");

    return {
      ...EMPTY_ADDRESS,
      address:
        completeAddress ||
        result.display_name ||
        "",
      landmark:
        address.amenity ||
        address.building ||
        "",
      city,
      state: address.state || "",
      pincode: address.postcode || "",
    };
  }

  // ============================================
  // Watch detected coordinates
  // ============================================
  useEffect(() => {
    if (!location) return;

    let mounted = true;

    async function resolveLocation() {
      setResolvingAddress(true);
      setLocationError("");
      setError("");

      try {
        const detectedAddress =
          await getAddressFromCoordinates(
            location.latitude,
            location.longitude
          );

        if (!mounted) return;

        setInitialValues(detectedAddress);
        setShowForm(true);
      } catch (err) {
        if (mounted) {
          setLocationError(
            err.message || "Unable to fetch your address."
          );
        }
      } finally {
        if (mounted) {
          setResolvingAddress(false);
        }
      }
    }

    resolveLocation();

    return () => {
      mounted = false;
    };
  }, [location]);

  // ============================================
  // Detect current location
  // ============================================
  function handleDetectLocation() {
    setError("");
    setLocationError("");
    setInitialValues(EMPTY_ADDRESS);

    detectLocation();
  }

  // ============================================
  // Add new address
  // ============================================
  async function handleAddAddress(formData) {
    setError("");
    setSaving(true);

    try {
      const response = await fetch("/api/v1/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to save address."
        );
      }

      const newAddress = result.data.address;

      setAddresses((previous) => [
        newAddress,
        ...previous.map((address) => ({
          ...address,
          isDefault: newAddress.isDefault
            ? false
            : address.isDefault,
        })),
      ]);

      onAddressSelect(newAddress.id);

      setShowForm(false);
      setInitialValues(EMPTY_ADDRESS);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ============================================
  // Open manual address form
  // ============================================
  function handleAddNew() {
    setError("");
    setLocationError("");
    setInitialValues(EMPTY_ADDRESS);
    setShowForm(true);
  }

  // ============================================
  // Cancel address form
  // ============================================
  function handleCancelForm() {
    setShowForm(false);
    setError("");
    setLocationError("");
    setInitialValues(EMPTY_ADDRESS);
  }

  // ============================================
  // UI
  // ============================================
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Delivery Address
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Select where you want your order delivered.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            <Plus size={16} />
            Add New
          </button>
        )}
      </div>

      {/* General Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Loading Saved Addresses */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2
            className="animate-spin text-gray-500"
            size={24}
          />
        </div>
      ) : showForm ? (
        /* Address Form */
        <AddressForm
          initialValues={initialValues}
          onSubmit={handleAddAddress}
          onCancel={handleCancelForm}
          saving={saving}
        />
      ) : (
        <>
          {/* Current Location */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={
                detectingLocation ||
                resolvingAddress ||
                !isGeolocationAvailable
              }
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {detectingLocation || resolvingAddress ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  {detectingLocation
                    ? "Detecting your location..."
                    : "Fetching your address..."}
                </>
              ) : (
                <>
                  <Navigation size={18} />
                  Use My Current Location
                </>
              )}
            </button>

            <p className="mt-2 text-center text-xs text-gray-500">
              Automatically detect your delivery address.
            </p>

            {(locationError || hookError) && (
              <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {locationError || hookError}
              </div>
            )}

            {!isGeolocationAvailable && (
              <p className="mt-3 text-sm text-red-600">
                Geolocation is not supported by your browser.
              </p>
            )}
          </div>

          {/* No Saved Addresses */}
          {addresses.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 py-8 text-center">
              <MapPin
                size={32}
                className="mx-auto text-gray-400"
              />

              <p className="mt-3 font-medium text-gray-800">
                No saved addresses
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Detect your location or add an address manually.
              </p>

              <button
                type="button"
                onClick={handleAddNew}
                className="mt-4 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white"
              >
                Add Address
              </button>
            </div>
          ) : (
            /* Saved Addresses */
            <div className="space-y-3">
              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  selected={
                    selectedAddressId === address.id
                  }
                  onSelect={() =>
                    onAddressSelect(address.id)
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
