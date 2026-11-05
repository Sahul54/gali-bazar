
import { ArrowLeft, Bike, ShieldCheck, Truck } from "lucide-react";

export default function RegisterHeader({
  onBack,
  title = "Delivery Partner Registration",
  heading = "Become a delivery partner",
  description = "Fill in your details and vehicle information to submit your application. Our team will review it before approval.",
  backLabel = "Back to login",
}) {
  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-orange-600"
      >
        <ArrowLeft size={17} />
        {backLabel}
      </button>

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-sm">
          <Truck size={25} />
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Gali Bazar
          </h1>
          <p className="text-sm text-slate-500">{title}</p>
        </div>
      </div>

      <div className="bg-orange-50 px-3 py-7 sm:px-9 sm:py-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
            <Bike size={26} />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {heading}
          </h2>
        </div>

        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
          {description}
        </p>

        <div className="mt-5 flex items-center gap-2 text-sm font-medium text-orange-700">
          <ShieldCheck size={18} />
          Your application will be reviewed by our admin team.
        </div>
      </div>
    </>
  );
}
