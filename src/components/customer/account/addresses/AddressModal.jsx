
"use client";

import { useEffect } from "react";
import { X, MapPin } from "lucide-react";
import AddressForm from "./AddressForm";

export default function AddressModal({
  open,
  onClose,
  initialValues,
  onSubmit,
  saving = false,
  isEditing = false,
}) {
  useEffect(() => {
    if (!open) return;

    function handleEscape(e) {
      if (e.key === "Escape" && !saving) {
        onClose?.();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose, saving]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) {
          onClose?.();
        }
      }}
    >
      <div className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl">
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
              <MapPin size={20} />
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-900">
                {isEditing ? "Edit Address" : "Add New Address"}
              </h2>

              <p className="mt-0.5 text-xs text-gray-500">
                Manage your delivery location
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close address modal"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5">
          <AddressForm
            initialValues={initialValues}
            onSubmit={onSubmit}
            onCancel={onClose}
            saving={saving}
            isEditing={isEditing}
          />
        </div>
      </div>
    </div>
  );
}
