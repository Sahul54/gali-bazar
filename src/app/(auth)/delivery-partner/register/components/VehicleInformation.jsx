import { Bike } from "lucide-react";

const VEHICLE_TYPES = [
  { value: "BIKE", label: "Bike" },
  { value: "SCOOTER", label: "Scooter" },
  { value: "MOTORCYCLE", label: "Motorcycle" },
  { value: "BICYCLE", label: "Bicycle" },
  { value: "THREE_WHEELER", label: "Three Wheeler" },
  { value: "OTHER", label: "Other" },
];

export default function VehicleInformation({ form, onChange }) {
  return (
    <section>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
          <Bike size={21} />
        </div>

        <div>
          <h3 className="font-semibold text-slate-900">
            Vehicle information
          </h3>
          <p className="text-sm text-slate-500">
            Add the details of the vehicle you will use.
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Vehicle type */}
        <div>
          <label
            htmlFor="vehicleType"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Vehicle type <span className="text-red-500">*</span>
          </label>

          <select
            id="vehicleType"
            name="vehicleType"
            value={form.vehicleType || ""}
            onChange={(e) => onChange("vehicleType", e.target.value)}
            required
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          >
            <option value="" disabled>
              Select vehicle type
            </option>

            {VEHICLE_TYPES.map((vehicle) => (
              <option key={vehicle.value} value={vehicle.value}>
                {vehicle.label}
              </option>
            ))}
          </select>
        </div>

        {/* Vehicle number */}
        <div>
          <label
            htmlFor="vehicleNumber"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Vehicle number <span className="text-red-500">*</span>
          </label>

          <input
            id="vehicleNumber"
            name="vehicleNumber"
            type="text"
            value={form.vehicleNumber || ""}
            onChange={(e) => onChange("vehicleNumber", e.target.value)}
            placeholder="e.g. MH02AB1234"
            maxLength={30}
            autoComplete="off"
            required
            className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm uppercase outline-none placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          />
        </div>

        {/* Vehicle model */}
        <div className="sm:col-span-2">
          <label
            htmlFor="vehicleModel"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Vehicle model{" "}
            <span className="font-normal text-slate-400">
              (Optional)
            </span>
          </label>

          <input
            id="vehicleModel"
            name="vehicleModel"
            type="text"
            value={form.vehicleModel || ""}
            onChange={(e) => onChange("vehicleModel", e.target.value)}
            placeholder="e.g. Honda Activa"
            maxLength={100}
            className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          />
        </div>
      </div>
    </section>
  );
}