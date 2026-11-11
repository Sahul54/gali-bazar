
"use client";

import { useState } from "react";
import {
  ChevronDown,
  Package,
  CreditCard,
  Truck,
  RotateCcw,
  UserRound,
} from "lucide-react";

const FAQS = [
  {
    category: "Orders",
    icon: Package,
    questions: [
      {
        question: "How can I track my order?",
        answer:
          "Visit the My Orders section in your account and select your order to check its current status and delivery updates.",
      },
      {
        question: "Can I cancel my order?",
        answer:
          "You can request cancellation for eligible orders. Open My Orders, select your order and check the available cancellation option.",
      },
    ],
  },
  {
    category: "Payments & Refunds",
    icon: CreditCard,
    questions: [
      {
        question: "What should I do if my payment fails?",
        answer:
          "Check your payment status before trying again. If money was deducted but your order was not confirmed, contact our support team with your transaction details.",
      },
      {
        question: "How can I get a refund?",
        answer:
          "Refund eligibility depends on the order and payment status. Contact our support team with your order ID for assistance.",
      },
    ],
  },
  {
    category: "Delivery",
    icon: Truck,
    questions: [
      {
        question: "What if my order is delayed?",
        answer:
          "Check your order status in My Orders. If the expected delivery time has passed, contact our support team.",
      },
    ],
  },
  {
    category: "Returns",
    icon: RotateCcw,
    questions: [
      {
        question: "Can I return a product?",
        answer:
          "Return eligibility depends on the product and applicable return policy. Contact support with your order details to check eligibility.",
      },
    ],
  },
  {
    category: "Account",
    icon: UserRound,
    questions: [
      {
        question: "How can I update my account details?",
        answer:
          "Visit the Profile section in your account to update your personal information. Some details may require additional verification.",
      },
    ],
  },
];

export default function FAQSection() {
  const [activeFAQ, setActiveFAQ] = useState(null);

  const toggleFAQ = (faqId) => {
    setActiveFAQ((current) => (current === faqId ? null : faqId));
  };

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
          Frequently Asked Questions
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Find quick answers to common questions.
        </p>
      </div>

      <div className="space-y-4">
        {FAQS.map((group, groupIndex) => {
          const Icon = group.icon;

          return (
            <div
              key={group.category}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
            >
              <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/70 px-4 py-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <Icon size={18} />
                </div>

                <h3 className="text-sm font-bold text-gray-900">
                  {group.category}
                </h3>
              </div>

              <div className="divide-y divide-gray-100 px-4">
                {group.questions.map((faq, questionIndex) => {
                  const faqId = `${groupIndex}-${questionIndex}`;
                  const isOpen = activeFAQ === faqId;

                  return (
                    <div key={faqId}>
                      <button
                        type="button"
                        onClick={() => toggleFAQ(faqId)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between gap-4 py-4 text-left"
                      >
                        <span className="text-sm font-semibold text-gray-800 transition-colors hover:text-green-700">
                          {faq.question}
                        </span>

                        <ChevronDown
                          size={18}
                          className={`shrink-0 text-gray-400 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-green-600" : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="pb-4 pr-6">
                          <p className="text-sm leading-6 text-gray-500">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
