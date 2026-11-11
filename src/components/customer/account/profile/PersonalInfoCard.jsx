
import { Mail, Phone, CalendarDays, UserRound } from "lucide-react";

export default function PersonalInfoCard({ user }) {
  const details = [
    {
      label: "Full Name",
      value: user?.name || "Not provided",
      icon: UserRound,
    },
    {
      label: "Email Address",
      value: user?.email || "Not provided",
      icon: Mail,
    },
    {
      label: "Phone Number",
      value: user?.phone || "Not provided",
      icon: Phone,
    },
    {
      label: "Member Since",
      value: user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
        : "Not available",
      icon: CalendarDays,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-gray-900">
          Personal Details
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Your basic account information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:gap-6 sm:p-6">
        {details.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
                <Icon size={19} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500">
                  {item.label}
                </p>
                <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
