
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import ProfileHeader from "@/components/customer/account/profile/ProfileHeader";
import PersonalInfoCard from "@/components/customer/account/profile/PersonalInfoCard";
import ProfileForm from "@/components/customer/account/profile/ProfileForm";
import ProfileSkeleton from "@/components/customer/account/profile/ProfileSkeleton";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/v1/customer/profile", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load profile.");
      }

      setUser(result.data.user);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleProfileUpdate = async (formData) => {
    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/v1/customer/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update profile.");
      }

      setUser((prev) => ({
        ...prev,
        ...result.data.user,
      }));

      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(err.message || "Unable to update profile.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error && !user) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white p-6 text-center">
        <p className="text-sm font-medium text-red-600">{error}</p>

        <button
          type="button"
          onClick={fetchProfile}
          className="mt-4 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfileHeader />

      <PersonalInfoCard user={user} />

      <ProfileForm
        user={user}
        onSave={handleProfileUpdate}
        saving={saving}
      />
    </div>
  );
}
