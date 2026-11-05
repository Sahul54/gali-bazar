
import { FileText, X } from "lucide-react";

import StatusBadge from "./StatusBadge";
import { formatDate, formatVehicle } from "./helpers";

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
}

function DocumentLink({ label, url }) {
  if (!url) {
    return (
      <div className="rounded-xl border border-slate-200 p-3">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 text-sm text-slate-400">Not uploaded</p>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm font-medium text-orange-700 transition hover:border-orange-300 hover:bg-orange-50"
    >
      <FileText size={18} />
      {label}
    </a>
  );
}

export default function ApplicationDetailsModal({
  application,
  onClose,
  onAction,
  updating,
}) {
  if (!application) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-modal-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="application-modal-title"
              className="text-xl font-bold text-slate-900"
            >
              Application details
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review delivery partner information and documents.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <DetailItem
            label="Partner name"
            value={application.user?.name}
          />
          <DetailItem
            label="Phone"
            value={application.user?.phone}
          />
          <DetailItem
            label="Email"
            value={application.user?.email}
          />
          <DetailItem
            label="Vehicle type"
            value={formatVehicle(application.vehicleType)}
          />
          <DetailItem
            label="Vehicle number"
            value={application.vehicleNumber}
          />
          <DetailItem
            label="Vehicle model"
            value={application.vehicleModel}
          />
          <DetailItem
            label="License number"
            value={application.licenseNumber}
          />
          <DetailItem
            label="Applied on"
            value={formatDate(application.createdAt)}
          />
          <DetailItem
            label="Reviewed on"
            value={formatDate(application.reviewedAt)}
          />
          <DetailItem
            label="Reapplication count"
            value={application.reapplyCount ?? 0}
          />
        </div>

        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Uploaded documents
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <DocumentLink
              label="Driving License"
              url={application.licenseDocumentUrl}
            />
            <DocumentLink
              label="Vehicle RC"
              url={application.vehicleDocumentUrl}
            />
          </div>
        </div>

        {application.status === "REJECTED" &&
          application.rejectionReason && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-900">
                Rejection reason
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-red-800">
                {application.rejectionReason}
              </p>
            </div>
          )}

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-5">
          <StatusBadge status={application.status} />

          {application.status === "PENDING" && (
            <div className="flex gap-2">
              <button
                type="button"
                disabled={updating}
                onClick={() => onAction(application, "REJECTED")}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>

              <button
                type="button"
                disabled={updating}
                onClick={() => onAction(application, "APPROVED")}
                className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                Approve
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
