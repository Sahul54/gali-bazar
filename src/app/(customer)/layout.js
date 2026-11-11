
import CustomerHeader from "@/components/customer/layout/CustomerHeader";
import CustomerFooter from "@/components/customer/layout/CustomerFooter";
import MobileNavigation from "@/components/customer/layout/MobileNavigation";

import { AuthProvider } from "@/context/customer/AuthContext";
import { CartProvider } from "@/context/customer/CartContext";
import { CheckoutProvider } from "@/context/customer/CheckoutContext";
import { LocationProvider } from "@/context/customer/LocationContext";

export const metadata = {
  title: "Gali Bazar | Shop Local, Shop Nearby",
  description:
    "Discover nearby shops, explore products, and shop from trusted local sellers with Gali Bazar.",
};

export default function CustomerLayout({ children }) {
  return (
    <LocationProvider>
    <AuthProvider>
      <CartProvider>
        <CheckoutProvider>
          <div className="flex min-h-screen flex-col bg-[#f8f9ff] text-[#0b1c30]">
            <CustomerHeader />

            <main className="flex-1 pb-20 md:pb-0">
              {children}
            </main>

            <CustomerFooter />
            <MobileNavigation />
          </div>
        </CheckoutProvider>
      </CartProvider>
    </AuthProvider>
    </LocationProvider>
  );
}
