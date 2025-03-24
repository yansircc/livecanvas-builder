import SessionProvider from "@/app/dashboard/components/session-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <main className="min-h-screen">{children}</main>
    </SessionProvider>
  );
}
