
import { MapPin, Plus } from "lucide-react";

export default function AddressHeader({ onAdd }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
            <MapPin size={21} />
          </div>

          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            My Addresses
          </h1>
        </div>

        <p className="mt-2 text-sm text-gray-500">
          Manage your saved delivery addresses.
        </p>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 sm:w-auto"
      >
        <Plus size={18} />
        Add New Address
      </button>
    </div>
  );
}
