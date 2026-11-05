import { UserRound } from "lucide-react";

export default function PersonalInformation({ form, onChange }) {
  return (
    <section>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <UserRound size={21} />
        </div>

        <div>
          <h3 className="font-semibold text-slate-900">
            Personal information
          </h3>
          <p className="text-sm text-slate-500">
            Enter your name as it appears on your documents.
          </p>
        </div>
      </div>

      <label
        htmlFor="fullName"
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        Full name <span className="text-red-500">*</span>
      </label>

      <input
        id="fullName"
        name="fullName"
        type="text"
        value={form.fullName || ""}
        onChange={(e) => onChange("fullName", e.target.value)}
        placeholder="Enter your full name"
        autoComplete="name"
        minLength={2}
        maxLength={100}
        required
        className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
      />
    </section>
  );
}