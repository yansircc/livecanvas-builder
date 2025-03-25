import SessionProvider from "@/app/dashboard/components/session-provider";
import { Footer } from "@/components/footer";
import { MainNav } from "@/components/nav/main-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <main className="flex min-h-screen flex-col gap-8">
        <MainNav />
        <div className="flex-grow">{children}</div>
        <Footer className="mt-auto" />
      </main>
    </SessionProvider>
  );
}
