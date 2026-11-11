
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Ticket,
  Clock,
  CheckCircle2,
  CircleDot,
  Loader2,
  RefreshCw,
} from "lucide-react";

const STATUS_CONFIG = {
  OPEN: {
    label: "Open",
    className: "bg-blue-50 text-blue-700",
    icon: CircleDot,
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-amber-50 text-amber-700",
    icon: Clock,
  },
  RESOLVED: {
    label: "Resolved",
    className: "bg-green-50 text-green-700",
    icon: CheckCircle2,
  },
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function SupportTicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/v1/customer/support", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to fetch support requests."
        );
      }

      setTickets(result.data?.tickets || []);
    } catch (err) {
      setError(err.message || "Unable to load support requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
            <Ticket size={20} />
          </div>

          <div>
            <h2 className="text-base font-bold text-gray-900 sm:text-lg">
              My Support Requests
            </h2>
            <p className="text-xs text-gray-500">
              Track your submitted complaints
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchTickets}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <Loader2 size={25} className="animate-spin" />
            <p className="mt-3 text-sm">Loading support requests...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={fetchTickets}
              className="mt-3 text-sm font-semibold text-red-700 underline"
            >
              Try again
            </button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <Ticket size={25} />
            </div>
            <h3 className="mt-4 text-sm font-bold text-gray-800">
              No support requests yet
            </h3>
            <p className="mt-1 max-w-xs text-xs leading-5 text-gray-500">
              Your submitted support requests will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => {
              const status =
                STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
              const StatusIcon = status.icon;

              return (
                <div
                  key={ticket.id}
                  className="rounded-xl border border-gray-100 p-4 transition hover:border-green-200"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-400">
                        Ticket ID: {ticket.id}
                      </p>

                      <h3 className="mt-1 break-words text-sm font-bold text-gray-900">
                        {ticket.subject}
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        {ticket.category?.replaceAll("_", " ")}
                        {" · "}
                        {formatDate(ticket.createdAt)}
                      </p>

                      {ticket.order?.orderNumber && (
                        <p className="mt-1 text-xs text-gray-500">
                          Order: {ticket.order.orderNumber}
                        </p>
                      )}
                    </div>

                    <span
                      className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}
                    >
                      <StatusIcon size={13} />
                      {status.label}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">
                    {ticket.message}
                  </p>

                  {ticket.status === "RESOLVED" && (
                    <div className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
                      Your support request has been resolved.
                    </div>
                  )}

                  {ticket.status === "IN_PROGRESS" && (
                    <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                      Our team is working on your request.
                    </div>
                  )}

                  {ticket.status === "OPEN" && (
                    <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
                      Your request has been received.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
