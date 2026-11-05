import { FileText, Upload, X } from "lucide-react";

function FileInput({ label, file, onChange, disabled }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label} <span className="text-red-500">*</span>
      </label>

      <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 p-4 transition hover:border-orange-500 hover:bg-orange-50/50">
        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
            <Upload size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800">
              {file ? file.name : "Choose document"}
            </p>

            <p className="text-xs text-slate-500">
              PDF, JPG or PNG · Maximum 5 MB
            </p>
          </div>

          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            disabled={disabled}
            onChange={(event) =>
              onChange(event.target.files?.[0] || null)
            }
            className="hidden"
          />
        </label>

        {file && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(null)}
            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            aria-label={`Remove ${label}`}
          >
            <X size={17} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function DocumentUpload({
  form,
  onChange,
  licenseFile,
  setLicenseFile,
  vehicleRCFile,
  setVehicleRCFile,
  disabled,
}) {
  return (
    <section>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <FileText size={21} />
        </div>

        <div>
          <h3 className="font-semibold text-slate-900">
            Driving license & documents
          </h3>

          <p className="text-sm text-slate-500">
            Enter your license details and upload both documents.
          </p>
        </div>
      </div>

      <label
        htmlFor="licenseNumber"
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        Driving license number{" "}
        <span className="text-red-500">*</span>
      </label>

      <input
        id="licenseNumber"
        name="licenseNumber"
        type="text"
        value={form.licenseNumber || ""}
        onChange={(e) => onChange("licenseNumber", e.target.value)}
        placeholder="Enter driving license number"
        maxLength={50}
        required
        className="mb-5 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm uppercase outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
      />

      <div className="space-y-4">
        <FileInput
          label="Driving License Document"
          file={licenseFile}
          onChange={setLicenseFile}
          disabled={disabled}
        />

        <FileInput
          label="Vehicle RC Document"
          file={vehicleRCFile}
          onChange={setVehicleRCFile}
          disabled={disabled}
        />
      </div>
    </section>
  );
}