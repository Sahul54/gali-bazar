
import { CheckCircle2, X, XCircle } from "lucide-react";

export default function ApplicationActionModal({
  action,
  reason,
  setReason,
  onConfirm,
  onClose,
  updating,
}) {
  if (!action) return null;

  const isReject = action.status === "REJECTED";
  const isValidReason =
    reason.trim().length >= 5 && reason.trim().length <= 1000;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="action-modal-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              isReject
                ? "bg-red-50 text-red-600"
                : "bg-green-50 text-green-600"
            }`}
          >
            {isReject ? (
              <XCircle size={24} />
            ) : (
              <CheckCircle2 size={24} />
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={updating}
            aria-label="Close confirmation"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={19} />
          </button>
        </div>

        <h2
          id="action-modal-title"
          className="mt-4 text-xl font-bold text-slate-900"
        >
          {isReject ? "Reject application" : "Approve application"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {isReject
            ? "Provide a clear reason so the delivery partner can correct the details and reapply."
            : `Are you sure you want to approve ${action.application?.user?.name || "this delivery partner"}?`}
        </p>

        {isReject && (
          <div className="mt-5">
            <label
              htmlFor="rejectionReason"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Rejection reason <span className="text-red-500">*</span>
            </label>

            <textarea
              id="rejectionReason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Explain why this application is being rejected..."
              rows={5}
              maxLength={1000}
              disabled={updating}
              className="w-full resize-y rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:bg-slate-50"
            />

            <div className="mt-2 flex justify-between text-xs">
              <span
                className={
                  reason.trim().length > 0 && !isValidReason
                    ? "text-red-600"
                    : "text-slate-400"
                }
              >
                Minimum 5 and maximum 1000 characters.
              </span>
              <span className="text-slate-400">
                {reason.length}/1000
              </span>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={updating}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={
              updating || (isReject && !isValidReason)
            }
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
              isReject
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isReject ? <XCircle size={17} /> : <CheckCircle2 size={17} />}
            {updating
              ? "Updating..."
              : isReject
                ? "Confirm rejection"
                : "Confirm approval"}
          </button>
        </div>
      </section>
    </div>
  );
}
