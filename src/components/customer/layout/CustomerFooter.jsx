
import Link from "next/link";

import {
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
} from "react-icons/fa";

const footerLinks = {
  "Quick Links": [
    { label: "Home", href: "/" },
    { label: "Explore Shops", href: "/shops" },
    { label: "All Products", href: "/products" },
    { label: "Categories", href: "/categories" },
  ],

  "Customer Support": [
    { label: "My Orders", href: "/account/orders" },
    { label: "My Account", href: "/account" },
    { label: "My Addresses", href: "/account/addresses" },
    { label: "Help & Support", href: "/help" },
  ],
};

const socialLinks = [
  {
    label: "Facebook",
    href: "#",
    Icon: FaFacebookF,
  },
  {
    label: "Instagram",
    href: "#",
    Icon: FaInstagram,
  },
  {
    label: "Twitter",
    href: "#",
    Icon: FaTwitter,
  },
];

export default function CustomerFooter() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <Link
              href="/"
              className="text-2xl font-extrabold text-green-600"
            >
              Gali<span className="text-gray-900">Bazar</span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-6 text-gray-500">
              Discover trusted local shops and shop your everyday
              essentials from nearby sellers.
            </p>

            {/* Social Media */}
            <div className="mt-5 flex gap-3">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-gray-100 p-2.5 text-gray-600 transition hover:bg-green-100 hover:text-green-600"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="font-semibold text-gray-900">
                {heading}
              </h3>

              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 transition hover:text-green-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900">
              Get in Touch
            </h3>

            <div className="mt-4 space-y-4">

              <div className="flex items-start gap-3 text-sm text-gray-500">
                <MapPin
                  size={18}
                  className="mt-0.5 shrink-0 text-green-600"
                />

                <span>
                  Supporting local businesses in your neighbourhood.
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Phone
                  size={18}
                  className="shrink-0 text-green-600"
                />

                <span>Contact support</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Mail
                  size={18}
                  className="shrink-0 text-green-600"
                />

                <span>Support email coming soon</span>
              </div>

            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-10 flex flex-col gap-3 border-t border-gray-100 pt-6 text-center text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>
            © 2026 Gali Bazar. All rights reserved.
          </p>

          <p>Made for local communities ❤️</p>
        </div>

      </div>
    </footer>
  );
}
