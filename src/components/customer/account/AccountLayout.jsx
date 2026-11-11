import AccountSidebar from "./AccountSidebar";

export default function AccountLayout({ children }) {
  return (
    <main className="min-h-screen bg-[#f8faf8]">
      <AccountSidebar />

      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:py-7 lg:pl-[16rem] lg:pr-8">
        {children}
      </div>
    </main>
  );
}