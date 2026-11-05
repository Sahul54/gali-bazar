
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "Gali Bazar | Shop Local, Shop Nearby",
    template: "%s | Gali Bazar",
  },
  description:
    "Discover nearby shops, explore products, and shop from trusted local sellers with Gali Bazar.",
  applicationName: "Gali Bazar",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col bg-white text-gray-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
