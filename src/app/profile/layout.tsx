import { Footer } from "@/components/footer";
import { MainNav } from "@/components/nav/main-nav";
import { auth } from "@/server/auth";
import type { Session } from "next-auth";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { Suspense } from "react";
import { Sidebar } from "./compoents/sidebar";

/**
 * 获取缓存会话数据
 * @param sessionData 会话数据
 * @returns 返回会话数据
 */
async function getCachedSessionData(sessionData: Session | null) {
  "use cache";
  cacheTag("auth");

  // 模拟一个加载延迟
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return sessionData;
}

async function SuspenseSidebar() {
  const sessionData = await auth();
  const session = await getCachedSessionData(sessionData);
  return <Sidebar session={session} />;
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <MainNav />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            {/* Left sidebar with profile card */}
            <div className="md:col-span-4 lg:col-span-3">
              <Suspense>
                <SuspenseSidebar />
              </Suspense>
            </div>

            {/* Right content area */}
            <div className="md:col-span-8 lg:col-span-9">{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
