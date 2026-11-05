
import {
  Bike,
  CalendarDays,
  CheckCircle2,
  Eye,
  LoaderCircle,
  Phone,
  XCircle,
} from "lucide-react";

import StatusBadge from "./StatusBadge";
import { formatDate, formatVehicle } from "./helpers";

export default function ApplicationTable({
  applications,
  updatingId,
  refreshing,
  onView,
  onAction,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1100px] text-left">
        <thead className="bg-slate-50">
          <tr className="border-y border-slate-200">
            {[
              "Partner",
              "Vehicle details",
              "License number",
              "Applied on",
              "Status",
              "Actions",
            ].map((heading) => (
              <th
                key={heading}
                className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {applications.map((application) => {
            const isUpdating = updatingId === application.id;
            const actionDisabled =
              updatingId !== null || refreshing;

            return (
              <tr
                key={application.id}
                className="transition hover:bg-slate-50"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 font-bold text-orange-600">
                      {(application.user?.name || "D")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {application.user?.name || "Unnamed partner"}
                      </p>

                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <Phone size={13} />
                        {application.user?.phone || "No phone"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-800">
                    {application.vehicleNumber || "No vehicle number"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {formatVehicle(application.vehicleType)}
                    {application.vehicleModel
                      ? ` · ${application.vehicleModel}`
                      : ""}
                  </p>
                </td>

                <td className="px-5 py-4 text-sm text-slate-600">
                  {application.licenseNumber || "—"}
                </td>

                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                    <CalendarDays size={15} className="text-slate-400" />
                    {formatDate(application.createdAt)}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={application.status} />
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onView(application)}
                      title="View application details"
                      aria-label="View application details"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                    >
                      <Eye size={16} />
                    </button>

                    {application.status === "PENDING" && (
                      <>
                        <button
                          type="button"
                          disabled={actionDisabled}
                          onClick={() => onAction(application, "APPROVED")}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <LoaderCircle size={14} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={14} />
                          )}
                          Approve
                        </button>

                        <button
                          type="button"
                          disabled={actionDisabled}
                          onClick={() => onAction(application, "REJECTED")}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </>
                    )}
                  </div>

                  {isUpdating && (
                    <p className="mt-2 text-xs text-slate-500">
                      Updating status...
                    </p>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
