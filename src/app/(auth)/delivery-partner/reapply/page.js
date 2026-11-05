
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  LoaderCircle,
  RefreshCw,
  Send,
} from "lucide-react";

import RegisterHeader from "../register/components/RegisterHeader";
import PersonalInformation from "../register/components/PersonalInformation";
import VehicleInformation from "../register/components/VehicleInformation";
import DocumentUpload from "../register/components/DocumentUpload";

const INITIAL_FORM = {
  fullName: "",
  vehicleType: "BIKE",
  vehicleNumber: "",
  vehicleModel: "",
  licenseNumber: "",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

export default function ReapplyPage() {
  const router = useRouter();

  const [form, setForm] = useState(INITIAL_FORM);

  const [licenseFile, setLicenseFile] = useState(null);
  const [vehicleRCFile, setVehicleRCFile] = useState(null);

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");

  // Load existing partner profile.
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/v1/delivery-partner/me",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        router.replace("/delivery-partner/login");
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load application details."
        );
      }

      const currentProfile = result.profile;

      if (!currentProfile) {
        throw new Error("Delivery partner profile not found.");
      }

      if (currentProfile.status !== "REJECTED") {
        router.replace("/delivery-partner/status");
        return;
      }

      setProfile(currentProfile);

      setForm({
        fullName: result.user?.name || "",
        vehicleType: currentProfile.vehicleType || "BIKE",
        vehicleNumber: currentProfile.vehicleNumber || "",
        vehicleModel: currentProfile.vehicleModel || "",
        licenseNumber: currentProfile.licenseNumber || "",
      });
    } catch (err) {
      setError(
        err.message || "Unable to load application details."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Update reusable form components.
  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]:
        field === "vehicleNumber" || field === "licenseNumber"
          ? value.toUpperCase()
          : value,
    }));
  };

  // Validate replacement documents.
  const validateFile = (file, label) => {
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error(
        `${label}: Only PDF, JPG and PNG are allowed.`
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error(
        `${label}: File size must not exceed 5 MB.`
      );
    }
  };

  // Upload document using existing Cloudinary API.
  const uploadDocument = async (file, documentType) => {
    if (!file) return null;

    const formData = new FormData();

    formData.append("file", file);
    formData.append("documentType", documentType);

    const response = await fetch(
      "/api/v1/delivery-partner/upload-document",
      {
        method: "POST",
        credentials: "include",
        body: formData,
      }
    );

    const result = await response.json().catch(() => null);

    if (
      !response.ok ||
      !result?.success ||
      !result?.document?.url
    ) {
      throw new Error(
        result?.message || `${documentType} upload failed.`
      );
    }

    return result.document.url;
  };

  // Submit reapplication.
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    setError("");

    try {
      if (!profile) {
        throw new Error("Application details are not available.");
      }

      if (form.fullName.trim().length < 2) {
        throw new Error("Please enter your full name.");
      }

      if (!form.vehicleNumber.trim()) {
        throw new Error("Please enter your vehicle number.");
      }

      if (!form.licenseNumber.trim()) {
        throw new Error("Driving license number is required.");
      }

      validateFile(licenseFile, "Driving License");
      validateFile(vehicleRCFile, "Vehicle RC");

      setSubmitting(true);

      // Upload only replacement documents.
      setUploading(true);

      const [newLicenseUrl, newVehicleRCUrl] =
        await Promise.all([
          licenseFile
            ? uploadDocument(licenseFile, "LICENSE")
            : Promise.resolve(null),

          vehicleRCFile
            ? uploadDocument(vehicleRCFile, "VEHICLE_RC")
            : Promise.resolve(null),
        ]);

      setUploading(false);

      // Reuse previous documents when no replacement is selected.
      const licenseDocumentUrl =
        newLicenseUrl || profile.licenseDocumentUrl;

      const vehicleDocumentUrl =
        newVehicleRCUrl || profile.vehicleDocumentUrl;

      if (!licenseDocumentUrl || !vehicleDocumentUrl) {
        throw new Error(
          "Please upload both driving license and vehicle RC documents."
        );
      }

      // Call reapply API.
      const response = await fetch(
        "/api/v1/delivery-partner/reapply",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            fullName: form.fullName.trim(),
            vehicleType: form.vehicleType,
            vehicleNumber: form.vehicleNumber.trim(),
            vehicleModel: form.vehicleModel.trim() || null,
            licenseNumber: form.licenseNumber.trim(),
            licenseDocumentUrl,
            vehicleDocumentUrl,
          }),
        }
      );

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message || "Unable to resubmit application."
        );
      }

      router.replace(
        result.nextPath || "/delivery-partner/status"
      );

      router.refresh();
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  // Loading state.
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-slate-500">
            Loading your application...
          </p>
        </div>
      </div>
    );
  }

  // Error state.
  if (error && !profile) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />

          <h2 className="text-lg font-bold text-slate-900">
            Unable to load application
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadProfile}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <RegisterHeader
        onBack={() => router.push("/delivery-partner/status")}
        title="Application Reapplication"
        heading="Update your application"
        description="Update your personal details, vehicle information or documents and resubmit your application for review."
        backLabel="Back to application status"
        />

        {/* Rejection notice */}
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-500" />

            <div>
              <h2 className="font-bold text-red-800">
                Application Rejected
              </h2>

              <p className="mt-1 text-sm text-red-700">
                Your previous application was rejected.
                Please correct the details and submit again.
              </p>

              {profile?.rejectionReason && (
                <div className="mt-4 rounded-xl border border-red-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Admin rejection reason
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-800">
                    {profile.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reapply form */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <form
            onSubmit={handleSubmit}
            className="space-y-8 p-6 sm:p-9"
          >
            <PersonalInformation
              form={form}
              onChange={handleChange}
            />

            <div className="border-t border-slate-100" />

            <VehicleInformation
              form={form}
              onChange={handleChange}
            />

            <div className="border-t border-slate-100" />

            <DocumentUpload
              form={form}
              onChange={handleChange}
              licenseFile={licenseFile}
              setLicenseFile={setLicenseFile}
              vehicleRCFile={vehicleRCFile}
              setVehicleRCFile={setVehicleRCFile}
              disabled={submitting}
            />

            <div className="rounded-xl bg-orange-50 p-4">
              <p className="text-sm leading-6 text-orange-800">
                Please verify all details before resubmitting.
                Your application will be reviewed again by our
                admin team.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
              >
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                disabled={submitting}
                onClick={() =>
                  router.push("/delivery-partner/status")
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <ArrowLeft size={17} />
                Back
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                    {uploading
                      ? "Uploading documents..."
                      : "Resubmitting..."}
                  </>
                ) : (
                  <>
                    <Send size={17} />
                    Submit Application Again
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          © 2026 Gali Bazar
        </p>
      </div>
    </main>
  );
}
