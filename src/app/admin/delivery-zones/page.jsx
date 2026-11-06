
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Plus,
  Search,
  RefreshCw,
  Layers3,
  CheckCircle2,
  XCircle,
  MapPinned,
  X,
  Loader2,
  IndianRupee,
  Power,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

const initialForm = {
  name: "",
  code: "",
  expressFee: "",
  scheduledFee: "",
  pincodes: "",
};

export default function DeliveryZonesPage() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchZones = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/v1/admin/delivery-zones");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to fetch delivery zones.");
      }

      setZones(result.data || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const stats = useMemo(() => {
    const activeZones = zones.filter((zone) => zone.isActive);
    const inactiveZones = zones.filter((zone) => !zone.isActive);

    const coveredPincodes = zones.reduce(
      (total, zone) =>
        total + (zone.pincodes?.filter((pin) => pin.isActive).length || 0),
      0
    );

    return {
      total: zones.length,
      active: activeZones.length,
      inactive: inactiveZones.length,
      pincodes: coveredPincodes,
    };
  }, [zones]);

  const filteredZones = useMemo(() => {
    return zones.filter((zone) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        zone.name.toLowerCase().includes(searchText) ||
        zone.code.toLowerCase().includes(searchText) ||
        zone.pincodes?.some((pin) =>
          pin.pincode.includes(search)
        );

      const matchesFilter =
        filter === "ALL" ||
        (filter === "ACTIVE" && zone.isActive) ||
        (filter === "INACTIVE" && !zone.isActive);

      return matchesSearch && matchesFilter;
    });
  }, [zones, search, filter]);

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleCreateZone(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const pincodes = form.pincodes
        .split(/[,\n]/)
        .map((pin) => pin.trim())
        .filter(Boolean);

      const response = await fetch("/api/v1/admin/delivery-zones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          code: form.code,
          expressFee: Number(form.expressFee),
          scheduledFee: Number(form.scheduledFee),
          pincodes,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to create zone.");
      }

      setSuccess("Delivery zone created successfully.");
      setForm(initialForm);
      setModalOpen(false);

      await fetchZones();
    } catch (err) {
      setError(err.message || "Unable to create delivery zone.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(zone) {
    const action = zone.isActive ? "deactivate" : "activate";

    if (!window.confirm(`Are you sure you want to ${action} this zone?`)) {
      return;
    }

    try {
      setUpdatingId(zone.id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/v1/admin/delivery-zones/${zone.id}/status`,
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
        throw new Error(result.message || "Unable to update zone.");
      }

      setSuccess(
        `Zone ${zone.isActive ? "deactivated" : "activated"} successfully.`
      );

      await fetchZones();
    } catch (err) {
      setError(err.message || "Unable to update zone.");
    } finally {
      setUpdatingId(null);
    }
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setForm(initialForm);
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <MapPin size={16} />
            <span>Delivery Management</span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Delivery Zones
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage delivery areas, pincodes and delivery charges.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F97316] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
        >
          <Plus size={18} />
          Create Zone
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={() => setError("")} aria-label="Dismiss error">
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <span>{success}</span>
          <button onClick={() => setSuccess("")} aria-label="Dismiss success">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Zones"
          value={stats.total}
          icon={Layers3}
          description="All delivery zones"
        />

        <StatCard
          title="Active Zones"
          value={stats.active}
          icon={CheckCircle2}
          description="Currently delivering"
        />

        <StatCard
          title="Inactive Zones"
          value={stats.inactive}
          icon={XCircle}
          description="Delivery disabled"
        />

        <StatCard
          title="Covered Pincodes"
          value={stats.pincodes}
          icon={MapPinned}
          description="Active serviceable pincodes"
        />
      </div>

      {/* Zone listing */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              All Delivery Zones
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              View and manage your delivery coverage.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search zone or pincode..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-400 sm:w-64"
              />
            </div>

            <div className="relative">
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm outline-none focus:border-orange-400 sm:w-40"
              >
                <option value="ALL">All Zones</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={fetchZones}
              disabled={loading}
              title="Refresh zones"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2.5 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="animate-spin text-[#F97316]" size={28} />
          </div>
        ) : filteredZones.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#F97316]">
              <MapPin size={26} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              {zones.length === 0 ? "No delivery zones yet" : "No zones found"}
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {zones.length === 0
                ? "Create your first delivery zone to start serving customers in selected areas."
                : "Try changing your search or filter."}
            </p>

            {zones.length === 0 && (
  <button
    onClick={() => setModalOpen(true)}
    className="mt-4 text-sm font-semibold text-[#F97316] hover:underline"
  >
    + Create your first zone
  </button>
)}
</div>
) : (
  <>
    {/* Desktop table */}
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-4 font-semibold">Zone</th>
            <th className="px-5 py-4 font-semibold">Pincodes</th>
            <th className="px-5 py-4 font-semibold">Express Fee</th>
            <th className="px-5 py-4 font-semibold">Scheduled Fee</th>
            <th className="px-5 py-4 font-semibold">Status</th>
            <th className="px-5 py-4 text-right font-semibold">Action</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {filteredZones.map((zone) => (
            
            <tr key={zone.id} className="transition hover:bg-slate-50">
              <td className="px-5 py-4">
                <p className="font-semibold text-slate-900">
                  {zone.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {zone.code}
                </p>
              </td>

              <td className="px-5 py-4">
                <div className="flex flex-wrap gap-1.5">
                  {zone.pincodes?.slice(0, 3).map((pin) => (
                    <span
                      key={pin.id}
                      className={`rounded-md px-2 py-1 text-xs ${
                        pin.isActive
                          ? "bg-slate-100 text-slate-700"
                          : "bg-red-50 text-red-500 line-through"
                      }`}
                    >
                      {pin.pincode}
                    </span>
                  ))}

                  {zone.pincodes?.length > 3 && (
                    <span className="rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700">
                      +{zone.pincodes.length - 3}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-slate-400">
                  {zone.pincodes?.filter((pin) => pin.isActive).length || 0} active
                  {" / "}
                  {zone.pincodes?.length || 0} total
                </p>
              </td>

              <td className="px-5 py-4 text-sm font-medium text-slate-700">
                ₹{Number(zone.expressFee).toFixed(2)}
              </td>

              <td className="px-5 py-4 text-sm font-medium text-slate-700">
                ₹{Number(zone.scheduledFee).toFixed(2)}
              </td>

              <td className="px-5 py-4">
                <StatusBadge active={zone.isActive} />
              </td>

              <td className="px-5 py-4">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/delivery-zones/${zone.id}`}
                    className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                  >
                    Manage
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(zone)}
                    disabled={updatingId === zone.id}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                      zone.isActive
                        ? "border-red-200 text-red-600 hover:bg-red-50"
                        : "border-green-200 text-green-700 hover:bg-green-50"
                    }`}
                  >
                    {updatingId === zone.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Power size={14} />
                    )}
                    {zone.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile cards */}
    <div className="space-y-3 p-4 md:hidden">
      {filteredZones.map((zone) => (
        <div
          key={zone.id}
          className="rounded-xl border border-slate-200 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900">
                {zone.name}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {zone.code}
              </p>
            </div>

            <StatusBadge active={zone.isActive} />
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {zone.pincodes?.map((pin) => (
              <span
                key={pin.id}
                className={`rounded-md px-2 py-1 text-xs ${
                  pin.isActive
                    ? "bg-slate-100 text-slate-700"
                    : "bg-red-50 text-red-500 line-through"
                }`}
              >
                {pin.pincode}
              </span>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
            <div>
              <p className="text-xs text-slate-500">Express</p>
              <p className="mt-1 text-sm font-semibold">
                ₹{Number(zone.expressFee).toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Scheduled</p>
              <p className="mt-1 text-sm font-semibold">
                ₹{Number(zone.scheduledFee).toFixed(2)}
              </p>
            </div>
          </div>

          <Link
            href={`/admin/delivery-zones/${zone.id}`}
            className="mt-4 flex w-full items-center justify-center rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-orange-50 hover:text-orange-600"
          >
            Manage Zone
          </Link>

          <button
            type="button"
            onClick={() => handleToggleStatus(zone)}
            disabled={updatingId === zone.id}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {updatingId === zone.id ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Power size={15} />
            )}
            {zone.isActive ? "Deactivate Zone" : "Activate Zone"}
          </button>
        </div>
      ))}
    </div>
  </>
)}

        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          Showing {filteredZones.length} of {zones.length} zones
        </div>
      </section>

      {/* Create zone modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Create Delivery Zone
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Add a new delivery area and its serviceable pincodes.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateZone} className="space-y-5 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Zone Name">
                  <input
                    required
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="e.g. Thane West"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Zone Code">
                  <input
                    required
                    name="code"
                    value={form.code}
                    onChange={handleFormChange}
                    placeholder="e.g. THANE-WEST"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Express Delivery Fee (₹)">
                  <div className="relative">
                    <IndianRupee
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      required
                      min="0"
                      step="0.01"
                      type="number"
                      name="expressFee"
                      value={form.expressFee}
                      onChange={handleFormChange}
                      placeholder="40"
                      className="form-input pl-9"
                    />
                  </div>
                </FormField>

                <FormField label="Scheduled Delivery Fee (₹)">
                  <div className="relative">
                    <IndianRupee
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      required
                      min="0"
                      step="0.01"
                      type="number"
                      name="scheduledFee"
                      value={form.scheduledFee}
                      onChange={handleFormChange}
                      placeholder="20"
                      className="form-input pl-9"
                    />
                  </div>
                </FormField>
              </div>

              <FormField label="Pincodes">
                <textarea
                  required
                  name="pincodes"
                  value={form.pincodes}
                  onChange={handleFormChange}
                  rows={4}
                  placeholder={"400601, 400602, 400603"}
                  className="form-input resize-none"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Enter multiple 6-digit pincodes separated by commas or new lines.
                </p>
              </FormField>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F97316] px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? "Creating..." : "Create Zone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

        .form-input::placeholder {
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#F97316]">
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-green-50 text-green-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-green-500" : "bg-slate-400"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function FormField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}
