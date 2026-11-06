
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Save,
  Plus,
  Trash2,
  Power,
  Loader2,
  IndianRupee,
  RefreshCw,
} from "lucide-react";

export default function DeliveryZoneDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [zone, setZone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingPincodes, setAddingPincodes] = useState(false);
  const [updatingPin, setUpdatingPin] = useState(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    expressFee: "",
    scheduledFee: "",
  });

  const [newPincodes, setNewPincodes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchZone = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/v1/admin/delivery-zones/${id}`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to fetch zone.");
      }

      const data = result.data;

      setZone(data);

      setForm({
        name: data.name,
        code: data.code,
        expressFee: String(data.expressFee),
        scheduledFee: String(data.scheduledFee),
      });
    } catch (err) {
      setError(err.message || "Unable to load delivery zone.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchZone();
  }, [id, fetchZone]);

  async function handleSave(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/v1/admin/delivery-zones/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            code: form.code,
            expressFee: Number(form.expressFee),
            scheduledFee: Number(form.scheduledFee),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update zone.");
      }

      setSuccess("Delivery zone updated successfully.");
      await fetchZone();
    } catch (err) {
      setError(err.message || "Unable to update delivery zone.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddPincodes(event) {
    event.preventDefault();

    try {
      setAddingPincodes(true);
      setError("");
      setSuccess("");

      const pincodes = newPincodes
        .split(/[,\n]/)
        .map((pin) => pin.trim())
        .filter(Boolean);

      const response = await fetch(
        `/api/v1/admin/delivery-zones/${id}/pincodes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pincodes }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to add pincodes.");
      }

      setNewPincodes("");
      setSuccess("Pincodes added successfully.");
      await fetchZone();
    } catch (err) {
      setError(err.message || "Unable to add pincodes.");
    } finally {
      setAddingPincodes(false);
    }
  }

  async function handleTogglePincode(pin) {
    try {
      setUpdatingPin(pin.id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/v1/admin/delivery-zones/pincodes/${pin.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: !pin.isActive,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update pincode.");
      }

      setSuccess(
        `Pincode ${pin.pincode} ${pin.isActive ? "deactivated" : "activated"}.`
      );

      await fetchZone();
    } catch (err) {
      setError(err.message || "Unable to update pincode.");
    } finally {
      setUpdatingPin(null);
    }
  }

  async function handleDeletePincode(pin) {
    if (!window.confirm(`Remove pincode ${pin.pincode} from this zone?`)) {
      return;
    }

    try {
      setUpdatingPin(pin.id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/v1/admin/delivery-zones/pincodes/${pin.id}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to remove pincode.");
      }

      setSuccess(`Pincode ${pin.pincode} removed successfully.`);
      await fetchZone();
    } catch (err) {
      setError(err.message || "Unable to remove pincode.");
    } finally {
      setUpdatingPin(null);
    }
  }

  async function handleToggleZone() {
    const action = zone.isActive ? "deactivate" : "activate";

    if (!window.confirm(`Are you sure you want to ${action} this zone?`)) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/v1/admin/delivery-zones/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: !zone.isActive,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update zone status.");
      }

      setSuccess("Zone status updated successfully.");
      await fetchZone();
    } catch (err) {
      setError(err.message || "Unable to update zone status.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={30} />
      </div>
    );
  }

  if (!zone) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <MapPin className="mx-auto text-slate-400" size={32} />
        <h2 className="mt-3 font-semibold">Delivery zone not found</h2>
        <Link
          href="/admin/delivery-zones"
          className="mt-4 inline-block text-sm font-semibold text-orange-600"
        >
          Back to Delivery Zones
        </Link>
      </div>
    );
  }

  const activePincodes =
    zone.pincodes?.filter((pin) => pin.isActive).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/admin/delivery-zones"
            className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-orange-600"
          >
            <ArrowLeft size={16} />
            Back to Delivery Zones
          </Link>

          <h1 className="text-2xl font-bold text-slate-900">
            {zone.name}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage zone details, charges and serviceable pincodes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggleZone}
          disabled={saving}
          className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold disabled:opacity-50 ${
            zone.isActive
              ? "border-red-200 text-red-600 hover:bg-red-50"
              : "border-green-200 text-green-700 hover:bg-green-50"
          }`}
        >
          <Power size={17} />
          {zone.isActive ? "Deactivate Zone" : "Activate Zone"}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat title="Total Pincodes" value={zone.pincodes?.length || 0} />
        <Stat title="Active Pincodes" value={activePincodes} />
        <Stat title="Inactive Pincodes" value={(zone.pincodes?.length || 0) - activePincodes} />
      </div>

      {/* Zone details */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="font-semibold text-slate-900">Zone Information</h2>
          <p className="mt-1 text-xs text-slate-500">
            Update zone name, code and delivery charges.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Zone Name">
              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="form-input"
              />
            </Field>

            <Field label="Zone Code">
              <input
                required
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value })
                }
                className="form-input"
              />
            </Field>

            <Field label="Express Delivery Fee (₹)">
              <input
                required
                min="0"
                step="0.01"
                type="number"
                value={form.expressFee}
                onChange={(e) =>
                  setForm({ ...form, expressFee: e.target.value })
                }
                className="form-input"
              />
            </Field>

            <Field label="Scheduled Delivery Fee (₹)">
              <input
                required
                min="0"
                step="0.01"
                type="number"
                value={form.scheduledFee}
                onChange={(e) =>
                  setForm({ ...form, scheduledFee: e.target.value })
                }
                className="form-input"
              />
            </Field>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F97316] px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save Changes
          </button>
        </form>
      </section>

      {/* Pincode management */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="font-semibold text-slate-900">
            Pincode Management
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Add, activate, deactivate or remove pincodes.
          </p>
        </div>

        <form
          onSubmit={handleAddPincodes}
          className="space-y-3 border-b border-slate-100 p-5"
        >
          <label className="block text-sm font-medium text-slate-700">
            Add New Pincodes
          </label>

          <textarea
            value={newPincodes}
            onChange={(e) => setNewPincodes(e.target.value)}
            rows={3}
            placeholder="400601, 400602, 400603"
            className="form-input resize-none"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Separate multiple pincodes with commas or new lines.
            </p>

            <button
              type="submit"
              disabled={addingPincodes || !newPincodes.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#F97316] px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {addingPincodes ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Add Pincodes
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-800">
            Serviceable Pincodes
          </h3>

          <button
            type="button"
            onClick={fetchZone}
            disabled={loading}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {!zone.pincodes?.length ? (
          <div className="px-5 pb-8 text-center text-sm text-slate-500">
            No pincodes added to this zone yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {zone.pincodes.map((pin) => (
              <div
                key={pin.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <MapPin size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {pin.pincode}
                    </p>

                    <p
                      className={`mt-1 text-xs font-medium ${
                        pin.isActive ? "text-green-600" : "text-slate-400"
                      }`}
                    >
                      {pin.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTogglePincode(pin)}
                    disabled={updatingPin === pin.id}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {updatingPin === pin.id
                      ? "Updating..."
                      : pin.isActive
                        ? "Deactivate"
                        : "Activate"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeletePincode(pin)}
                    disabled={updatingPin === pin.id}
                    title="Remove pincode"
                    className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <style jsx>{`
        .form-input {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 11px 13px;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          border-color: #f97316;
        }
      `}</style>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}
