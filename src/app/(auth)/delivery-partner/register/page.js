
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";

import RegisterHeader from "./components/RegisterHeader";
import PersonalInformation from "./components/PersonalInformation";
import VehicleInformation from "./components/VehicleInformation";
import DocumentUpload from "./components/DocumentUpload";

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

export default function DeliveryPartnerRegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState(INITIAL_FORM);
  const [licenseFile, setLicenseFile] = useState(null);
  const [vehicleRCFile, setVehicleRCFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "vehicleNumber" || name === "licenseNumber"
          ? value.toUpperCase()
          : value,
    }));
  };

  const validateFile = (file, label) => {
    if (!file) {
      throw new Error(`${label} is required.`);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`${label}: Only PDF, JPG and PNG are allowed.`);
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`${label}: File size must not exceed 5 MB.`);
    }
  };

  const uploadDocument = async (file, documentType) => {
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

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.success || !data?.document?.url) {
      throw new Error(data?.message || "Document upload failed.");
    }

    return data.document.url;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.vehicleNumber.trim()) {
      setError("Please enter your vehicle number.");
      return;
    }

    if (!form.licenseNumber.trim()) {
      setError("Driving license number is required.");
      return;
    }

    try {
      validateFile(licenseFile, "Driving License");
      validateFile(vehicleRCFile, "Vehicle RC");

      setLoading(true);
      setUploading(true);

      const licenseDocumentUrl = await uploadDocument(
        licenseFile,
        "LICENSE"
      );

      const vehicleDocumentUrl = await uploadDocument(
        vehicleRCFile,
        "VEHICLE_RC"
      );

      setUploading(false);

      const response = await fetch(
        "/api/v1/delivery-partner/register",
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

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to submit your application."
        );
      }

      router.replace(data.nextPath || "/delivery-partner/status");
      router.refresh();
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <RegisterHeader
          onBack={() => router.push("/delivery-partner/status")}
          title="Application Reapplication"
          heading="Update your application"
          description="Update your personal details, vehicle information or documents and resubmit your application for review."
          backLabel="Back to application status"
        />

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8 p-6 sm:p-9">
            <PersonalInformation
              form={form}
              onChange={updateField}
            />

            <div className="border-t border-slate-100" />

            <VehicleInformation
              form={form}
              onChange={updateField}
            />

            <div className="border-t border-slate-100" />

            <DocumentUpload
              form={form}
              onChange={updateField}
              licenseFile={licenseFile}
              setLicenseFile={setLicenseFile}
              vehicleRCFile={vehicleRCFile}
              setVehicleRCFile={setVehicleRCFile}
              disabled={loading}
            />

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0 text-green-600"
                />
                <p className="text-sm leading-6 text-slate-600">
                  By submitting this form, you confirm that the
                  information provided is accurate. Your account will
                  remain pending until the admin team reviews your
                  application.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3.5 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle size={19} className="animate-spin" />
                  {uploading
                    ? "Uploading documents..."
                    : "Submitting application..."}
                </>
              ) : (
                <>
                  Submit application
                  <ArrowRight size={19} />
                </>
              )}
            </button>
          </form>
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          © 2026 Gali Bazar
        </p>
      </div>
    </main>
  );
}
