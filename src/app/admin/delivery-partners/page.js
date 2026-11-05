
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Bike,
  LoaderCircle,
} from "lucide-react";

import AdminHeader from "./components/AdminHeader";
import SummaryGrid from "./components/SummaryGrid";
import ApplicationFilters from "./components/ApplicationFilters";
import ApplicationTable from "./components/ApplicationTable";
import Pagination from "./components/Pagination";
import ApplicationDetailsModal from "./components/ApplicationDetailsModal";
import ApplicationActionModal from "./components/ApplicationActionModal";

import { EMPTY_SUMMARY } from "./components/constants";

export default function AdminDeliveryPartnersPage() {
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [applications, setApplications] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  const [status, setStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [selectedApplication, setSelectedApplication] = useState(null);

  const [action, setAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Load applications and summary
  const loadApplications = useCallback(
    async ({ manual = false } = {}) => {
      setError("");

      if (manual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const params = new URLSearchParams({
          page: String(pagination.page),
          pageSize: String(pagination.pageSize),
        });

        if (status) params.set("status", status);
        if (search) params.set("search", search);

        const response = await fetch(
          `/api/v1/admin/delivery-partners?${params.toString()}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const result = await response.json().catch(() => null);

        if (response.status === 401) {
          throw new Error("Please log in with your admin account.");
        }

        if (response.status === 403) {
          throw new Error(
            "You do not have permission to access this page."
          );
        }

        if (!response.ok || !result?.success) {
          throw new Error(
            result?.message || "Unable to load applications."
          );
        }

        setSummary(result.summary || EMPTY_SUMMARY);
        setApplications(result.applications || []);

        setPagination((previous) => ({
          ...previous,
          ...(result.pagination || {}),
        }));
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [pagination.page, pagination.pageSize, status, search]
  );

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  // Search
  function handleSearch(event) {
    event.preventDefault();

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));

    setSearch(searchInput.trim());
  }

  // Status filter
  function handleFilterChange(value) {
    setStatus(value);

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));
  }

  // Pagination
  function changePage(nextPage) {
    if (
      nextPage < 1 ||
      nextPage > pagination.totalPages ||
      nextPage === pagination.page
    ) {
      return;
    }

    setPagination((previous) => ({
      ...previous,
      page: nextPage,
    }));
  }

  // Open approve/reject confirmation
  function handleActionRequest(application, nextStatus) {
    if (!application?.id || application.status !== "PENDING") {
      setActionError("Only pending applications can be updated.");
      return;
    }

    setActionError("");
    setRejectionReason("");

    setAction({
      application,
      status: nextStatus,
    });
  }

  // Approve or reject application
  async function confirmApplicationAction() {
    if (!action?.application?.id) return;

    const applicationId = action.application.id;
    const nextStatus = action.status;

    if (!["APPROVED", "REJECTED"].includes(nextStatus)) {
      setActionError("Invalid application action.");
      return;
    }

    const reason = rejectionReason.trim();

    if (
      nextStatus === "REJECTED" &&
      (reason.length < 5 || reason.length > 1000)
    ) {
      setActionError(
        "Rejection reason must contain 5 to 1000 characters."
      );
      return;
    }

    setUpdatingId(applicationId);
    setActionError("");

    try {
      const response = await fetch(
        `/api/v1/admin/delivery-partners/${applicationId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: nextStatus,
            ...(nextStatus === "REJECTED" ? { reason } : {}),
          }),
        }
      );

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message || "Unable to update application status."
        );
      }

      const updatedApplication = {
        ...action.application,
        ...(result.application || {}),
        status: result.application?.status || nextStatus,
        rejectionReason:
          result.application?.rejectionReason ||
          (nextStatus === "REJECTED" ? reason : null),
      };

      setSelectedApplication((previous) =>
        previous?.id === applicationId
          ? updatedApplication
          : previous
      );

      setAction(null);
      setRejectionReason("");

      await loadApplications({ manual: true });
    } catch (err) {
      setActionError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <AdminHeader
          onRefresh={() => loadApplications({ manual: true })}
          refreshing={refreshing}
          disabled={loading || refreshing || updatingId !== null}
        />

        <SummaryGrid summary={summary} />

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <ApplicationFilters
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            onSearch={handleSearch}
            status={status}
            onFilterChange={handleFilterChange}
          />

          {actionError && (
            <div
              role="alert"
              className="mx-5 mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle size={19} className="shrink-0" />
              <p className="flex-1">{actionError}</p>

              <button
                type="button"
                onClick={() => setActionError("")}
                className="font-semibold"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="m-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle size={19} className="mt-0.5 shrink-0" />

              <div className="flex-1">{error}</div>

              <button
                type="button"
                onClick={() => loadApplications({ manual: true })}
                className="font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3">
              <LoaderCircle
                size={30}
                className="animate-spin text-orange-600"
              />
              <p className="text-sm text-slate-500">
                Loading applications...
              </p>
            </div>
          ) : !error && applications.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Bike size={27} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                No applications found
              </h3>

              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Try another status filter or search term.
              </p>
            </div>
          ) : !error ? (
            <>
              <ApplicationTable
                applications={applications}
                updatingId={updatingId}
                refreshing={refreshing}
                onView={setSelectedApplication}
                onAction={handleActionRequest}
              />

              <Pagination
                pagination={pagination}
                onPageChange={changePage}
              />
            </>
          ) : null}
        </section>
      </div>

      {/* Application details */}
      <ApplicationDetailsModal
        application={selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onAction={handleActionRequest}
        updating={updatingId !== null}
      />

      {/* Approve / Reject confirmation */}
      <ApplicationActionModal
        action={action}
        reason={rejectionReason}
        setReason={setRejectionReason}
        onConfirm={confirmApplicationAction}
        onClose={() => {
          if (updatingId !== null) return;
          setAction(null);
          setRejectionReason("");
        }}
        updating={updatingId !== null}
      />
    </main>
  );
}
