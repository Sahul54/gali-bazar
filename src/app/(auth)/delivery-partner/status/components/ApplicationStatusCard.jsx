
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

const STATUS_CONFIG = {
  PENDING: {
    title: "Application under review",
    description:
      "Our team is reviewing your details. Please check back later for an update.",
    icon: Clock3,
    iconClass: "text-amber-600 bg-amber-100",
    badgeClass: "bg-amber-100 text-amber-800",
    badge: "Pending review",
  },
  APPROVED: {
    title: "Application approved!",
    description:
      "Congratulations! Your delivery partner application has been approved.",
    icon: CheckCircle2,
    iconClass: "text-green-600 bg-green-100",
    badgeClass: "bg-green-100 text-green-800",
    badge: "Approved",
  },
  REJECTED: {
    title: "Application not approved",
    description:
      "Your application needs some changes. Review the reason below and submit it again.",
    icon: XCircle,
    iconClass: "text-red-600 bg-red-100",
    badgeClass: "bg-red-100 text-red-800",
    badge: "Rejected",
  },
};

export default function ApplicationStatusCard({ profile, onDashboard, onReapply }) {
  const config = STATUS_CONFIG[profile?.status];
  const StatusIcon = config?.icon || AlertCircle;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-6 sm:p-9">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
              config?.iconClass || "bg-slate-100 text-slate-600"
            }`}
          >
            <StatusIcon size={34} />
          </div>

          <div className="flex-1">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                config?.badgeClass || "bg-slate-100 text-slate-700"
              }`}
            >
              {config?.badge || profile?.status || "Unknown"}
            </span>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {config?.title || "Application status"}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              {config?.description ||
                "Your application status is currently unavailable."}
            </p>
          </div>
        </div>

        {profile?.status === "PENDING" && (
          <div className="mt-7 rounded-xl bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <Clock3
                className="mt-0.5 shrink-0 text-amber-700"
                size={20}
              />
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  What happens next?
                </p>
                <p className="mt-1 text-sm leading-6 text-amber-800">
                  The admin team will verify your submitted details.
                  Once approved, you can access your delivery dashboard.
                </p>
              </div>
            </div>
          </div>
        )}

        {profile?.status === "APPROVED" && (
          <button
            type="button"
            onClick={onDashboard}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3.5 font-semibold text-white hover:bg-orange-700 sm:w-auto"
          >
            Go to dashboard <ArrowRight size={18} />
          </button>
        )}

        {profile?.status === "REJECTED" && (
          <div className="mt-7 space-y-4">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-900">
                Reason for rejection
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-red-800">
                {profile?.rejectionReason ||
                  "No rejection reason was provided. Please contact support."}
              </p>
            </div>

            <p className="text-xs text-slate-500">
              You can correct your details and submit a new application.
              Your existing account will remain the same.
            </p>

            <button
              type="button"
              onClick={onReapply}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3.5 font-semibold text-white hover:bg-orange-700 sm:w-auto"
            >
              Update details & reapply <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
