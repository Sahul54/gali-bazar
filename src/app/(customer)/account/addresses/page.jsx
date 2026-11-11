
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import AddressHeader from "@/components/customer/account/addresses/AddressHeader";
import AddressCard from "@/components/customer/account/addresses/AddressCard";
import AddressModal from "@/components/customer/account/addresses/AddressModal";
import AddressEmptyState from "@/components/customer/account/addresses/AddressEmptyState";
import AddressSkeleton from "@/components/customer/account/addresses/AddressSkeleton";

const EMPTY_ADDRESS = {
  fullName: "",
  phone: "",
  address: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  label: "HOME",
  isDefault: false,
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingDefaultId, setUpdatingDefaultId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // ============================================
  // Fetch Addresses
  // ============================================

  const fetchAddresses = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const response = await fetch("/api/v1/addresses", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to fetch addresses."
        );
      }

      setAddresses(result.data?.addresses || []);
      return true;
    } catch (err) {
      toast.error(err.message || "Unable to load addresses.");
      return false;
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // ============================================
  // Open Add Modal
  // ============================================

  function handleAdd() {
    setSelectedAddress(null);
    setShowModal(true);
  }

  // ============================================
  // Open Edit Modal
  // ============================================

  function handleEdit(address) {
    setSelectedAddress(address);
    setShowModal(true);
  }

  // ============================================
  // Close Modal
  // ============================================

  function handleClose() {
    if (saving) return;

    setShowModal(false);
    setSelectedAddress(null);
  }

  // ============================================
  // Add / Update Address
  // ============================================

  async function handleSave(formData) {
    try {
      setSaving(true);

      const isEditing = Boolean(selectedAddress?.id);

      // Default address cannot be unset directly.
      // First set another address as default.
      if (
        isEditing &&
        selectedAddress.isDefault &&
        !formData.isDefault
      ) {
        throw new Error(
          "Set another address as default before changing this address."
        );
      }

      let response;
      let result;

      if (isEditing) {
        const { isDefault, ...updateData } = formData;

        // Update existing address
        response = await fetch(
          `/api/v1/addresses/${selectedAddress.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          }
        );

        result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to update address."
          );
        }

        // Set as default if requested
        if (isDefault && !selectedAddress.isDefault) {
          const defaultResponse = await fetch(
            `/api/v1/addresses/${selectedAddress.id}/default`,
            {
              method: "POST",
            }
          );

          const defaultResult = await defaultResponse.json();

          if (!defaultResponse.ok || !defaultResult.success) {
            throw new Error(
              defaultResult.message ||
                "Address updated, but default address could not be changed."
            );
          }
        }

        toast.success("Address updated successfully.");
      } else {
        // Create new address
        response = await fetch("/api/v1/addresses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to add address."
          );
        }

        toast.success("Address added successfully.");
      }

      setShowModal(false);
      setSelectedAddress(null);

      await fetchAddresses(false);
    } catch (err) {
      toast.error(err.message || "Unable to save address.");
      throw err;
    } finally {
      setSaving(false);
    }
  }

  // ============================================
  // Delete Address
  // ============================================

  async function handleDelete(address) {
    const confirmed = window.confirm(
      `Are you sure you want to delete the ${address.label || ""} address?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(address.id);

      const response = await fetch(
        `/api/v1/addresses/${address.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to delete address."
        );
      }

      toast.success("Address deleted successfully.");

      // Backend may promote another address automatically.
      await fetchAddresses(false);
    } catch (err) {
      toast.error(err.message || "Unable to delete address.");
    } finally {
      setDeletingId(null);
    }
  }

  // ============================================
  // Set Default Address
  // ============================================

  async function handleSetDefault(address) {
    if (updatingDefaultId) return;

    if (address.isDefault) {
      toast.info("This is already your default address.");
      return;
    }

    try {
      setUpdatingDefaultId(address.id);

      const response = await fetch(
        `/api/v1/addresses/${address.id}/default`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to update default address."
        );
      }

      // Update UI immediately
      setAddresses((previous) =>
        previous.map((item) => ({
          ...item,
          isDefault: item.id === address.id,
        }))
      );

      toast.success("Default address updated successfully.");
    } catch (err) {
      toast.error(
        err.message || "Unable to update default address."
      );
    } finally {
      setUpdatingDefaultId(null);
    }
  }

  // ============================================
  // UI
  // ============================================

  return (
    <div className="min-w-0 space-y-6">
      {/* Page Header */}
      <AddressHeader onAdd={handleAdd} />

      {/* Loading */}
      {loading ? (
        <AddressSkeleton />
      ) : addresses.length === 0 ? (
        /* Empty State */
        <AddressEmptyState onAdd={handleAdd} />
      ) : (
        /* Saved Addresses */
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Saved Addresses
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {addresses.length}{" "}
                {addresses.length === 1 ? "address" : "addresses"} saved
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
                deleting={deletingId === address.id}
                updatingDefault={updatingDefaultId === address.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Add / Edit Modal */}
      <AddressModal
        open={showModal}
        onClose={handleClose}
        initialValues={selectedAddress || EMPTY_ADDRESS}
        onSubmit={handleSave}
        saving={saving}
        isEditing={Boolean(selectedAddress)}
      />
    </div>
  );
}
