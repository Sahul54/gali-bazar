
import Link from "next/link";
import {
  UserRound,
  Phone,
  Mail,
  CalendarDays,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

import {
  getDisplayName,
  getInitials,
  formatDate,
} from "@/lib/account/helpers";

export default function ProfileCard({ user = {} }) {
  const displayName = getDisplayName(user?.name);
  const initials = getInitials(displayName);

  const details = [
    {
      label: "Mobile Number",
      value: user?.phone || "Not added",
      icon: Phone,
    },
    {
      label: "Email Address",
      value: user?.email || "Not added",
      icon: Mail,
    },
    {
      label: "Member Since",
      value: user?.createdAt ? formatDate(user.createdAt) : "N/A",
      icon: CalendarDays,
    },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-5">
        <div>
          <h2 className="text-base font-bold text-gray-900 sm:text-lg">
            Personal Information
          </h2>
          <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
            Your account details
          </p>
        </div>

        <Link
          href="/account/profile"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:border-green-300 hover:bg-green-100 sm:text-sm"
        >
          <UserRound size={15} />
          Edit Profile
          <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="p-4 sm:p-5">
        {/* User Info */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-700 text-base font-bold uppercase tracking-wide text-white shadow-sm sm:h-14 sm:w-14 sm:text-lg">
            {initials || <UserRound size={24} />}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-gray-900 sm:text-lg">
              {displayName}
            </h3>

            <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-1 text-[11px] font-medium text-green-700 sm:text-xs">
              <ShieldCheck size={13} />
              Gali Bazar Account
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
          {details.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="min-w-0 rounded-xl border border-gray-100 bg-gray-50/70 p-3 transition hover:border-green-100 hover:bg-green-50/50 sm:p-3.5"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-green-700 shadow-sm">
                    <Icon size={15} />
                  </div>

                  <p className="truncate text-[11px] font-medium text-gray-500 sm:text-xs">
                    {item.label}
                  </p>
                </div>

                <p className="mt-2 truncate text-xs font-semibold text-gray-900 sm:text-sm">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <Link
          href="/account/profile"
          className="mt-4 flex items-center justify-between rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100"
        >
          <span>Manage Personal Information</span>
          <ArrowUpRight size={17} />
        </Link>
      </div>
    </section>
  );
}
