
import {
  MessageCircle,
  Mail,
  Clock,
  ArrowUpRight,
} from "lucide-react";

// Replace these with actual Gali Bazar support details.
const SUPPORT_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

export default function ContactSupport() {
  const whatsappNumber = SUPPORT_WHATSAPP?.replace(/\D/g, "");

  const whatsappMessage = encodeURIComponent(
    "Hi Gali Bazar Support, I need help with my order/account."
  );

  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`
    : null;

  const emailLink = SUPPORT_EMAIL
    ? `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
        "Gali Bazar - Customer Support"
      )}`
    : null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
          Contact Support
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Can't find your answer? Get in touch with our team.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* WhatsApp Support */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-green-200 hover:shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
            <MessageCircle size={22} />
          </div>

          <h3 className="mt-4 text-base font-bold text-gray-900">
            WhatsApp Support
          </h3>

          <p className="mt-1 text-sm leading-6 text-gray-500">
            Chat with our support team for quick assistance.
          </p>

          <a
            href={whatsappLink || undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!whatsappLink}
            className={`mt-5 inline-flex items-center gap-2 text-sm font-semibold ${
              whatsappLink
                ? "text-green-700 hover:text-green-800"
                : "cursor-not-allowed text-gray-400"
            }`}
          >
            Chat on WhatsApp
            <ArrowUpRight size={16} />
          </a>

          {!whatsappLink && (
            <p className="mt-2 text-xs text-amber-600">
              WhatsApp support number is not configured yet.
            </p>
          )}
        </div>

        {/* Email Support */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-green-200 hover:shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Mail size={22} />
          </div>

          <h3 className="mt-4 text-base font-bold text-gray-900">
            Email Support
          </h3>

          <p className="mt-1 text-sm leading-6 text-gray-500">
            Send us your query and we'll help you resolve it.
          </p>

          <a
            href={emailLink || undefined}
            aria-disabled={!emailLink}
            className={`mt-5 inline-flex items-center gap-2 text-sm font-semibold ${
              emailLink
                ? "text-green-700 hover:text-green-800"
                : "cursor-not-allowed text-gray-400"
            }`}
          >
            Send an Email
            <ArrowUpRight size={16} />
          </a>

          {!emailLink && (
            <p className="mt-2 text-xs text-amber-600">
              Support email is not configured yet.
            </p>
          )}
        </div>
      </div>

      {/* Support Hours */}
      <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
        <Clock size={19} className="mt-0.5 shrink-0 text-gray-500" />

        <div>
          <p className="text-sm font-semibold text-gray-800">
            Support Hours
          </p>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            Contact our team during business hours for assistance.
          </p>
        </div>
      </div>
    </section>
  );
}
