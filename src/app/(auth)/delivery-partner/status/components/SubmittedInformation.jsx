
import {
  Bike,
  FileText,
  ShieldCheck,
  Truck,
  UserRound,
} from "lucide-react";

import InfoItem from "./InfoItem";

function formatVehicle(value) {
  if (!value) return "Not provided";

  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function SubmittedInformation({ user, profile }) {
  return (
    <section className="mt-0 p-6 sm:p-9">
      <h3 className="flex items-center gap-2 font-semibold text-slate-900">
        <FileText size={19} />
        Submitted information
      </h3>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <InfoItem
          icon={UserRound}
          label="Full name"
          value={user?.name}
        />

        <InfoItem
          icon={FileText}
          label="Mobile number"
          value={user?.phone}
        />

        <InfoItem
          icon={Bike}
          label="Vehicle type"
          value={formatVehicle(profile?.vehicleType)}
        />

        <InfoItem
          icon={Truck}
          label="Vehicle number"
          value={profile?.vehicleNumber}
        />

        <InfoItem
          icon={Bike}
          label="Vehicle model"
          value={profile?.vehicleModel}
        />

        <InfoItem
          icon={ShieldCheck}
          label="Driving license"
          value={profile?.licenseNumber}
        />
      </div>

      {typeof profile?.reapplyCount === "number" &&
        profile.reapplyCount > 0 && (
          <p className="mt-4 text-xs text-slate-500">
            Reapplication count: {profile.reapplyCount}
          </p>
        )}

      <p className="mt-6 text-xs text-slate-400">
        Application submitted {formatDate(profile?.createdAt)}
      </p>
    </section>
  );
}
