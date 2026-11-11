
import { UserRound } from "lucide-react";

export default function ProfileHeader() {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
          <UserRound size={22} />
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Personal Information
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your personal details and account information.
          </p>
        </div>
      </div>
    </div>
  );
}
