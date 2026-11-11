
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import SupportHeader from "@/components/customer/account/support/SupportHeader";
import FAQSection from "@/components/customer/account/support/FAQSection";
import ContactSupport from "@/components/customer/account/support/ContactSupport";
import SupportTicketForm from "@/components/customer/account/support/SupportTicketForm";
import SupportTicketList from "@/components/customer/account/support/SupportTicketList";

export default function SupportPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ticketRefreshKey, setTicketRefreshKey] = useState(0);

  // Fetch customer profile
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/v1/customer/profile", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load customer details."
        );
      }

      setUser(result.data.user);
    } catch (error) {
      toast.error(error.message || "Unable to load customer details.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Submit Support Ticket
  const handleSupportSubmit = async (formData) => {
    try {
      setSubmitting(true);

      const response = await fetch("/api/v1/customer/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to submit support request."
        );
      }

      toast.success("Support request submitted successfully!", {
        description: "Our team will review your request shortly.",
      });

      // Refresh ticket history after successful submission
      setTicketRefreshKey((prev) => prev + 1);

      return result.data.ticket;
    } catch (error) {
      toast.error(error.message || "Unable to submit support request.");
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-w-0 space-y-7">
      {/* Page Header */}
      <SupportHeader />

      {/* FAQ Section */}
      <FAQSection />

      {/* Contact Support */}
      <ContactSupport />

      {/* Support Request Form */}
      {!loading && user && (
        <SupportTicketForm
          user={user}
          onSubmit={handleSupportSubmit}
          submitting={submitting}
        />
      )}

      {/* Profile Loading Skeleton */}
      {loading && (
        <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6">
          <div className="h-5 w-48 rounded bg-gray-100" />
          <div className="mt-4 h-10 rounded-xl bg-gray-100" />
          <div className="mt-3 h-10 rounded-xl bg-gray-100" />
          <div className="mt-3 h-24 rounded-xl bg-gray-100" />
        </div>
      )}

      {/* Customer Support Ticket History */}
      {!loading && user && (
        <SupportTicketList key={ticketRefreshKey} />
      )}
    </div>
  );
}
