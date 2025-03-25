import { Footer } from "@/components/footer";
import { MainNav } from "@/components/nav/main-nav";
import { auth } from "@/server/auth";
import { addAuthCacheTags } from "@/server/cache";
import type { Session } from "next-auth";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LoadingSpinner } from "./components/loading-spinner";
import { PreviewContent } from "./components/preview-content";

// Must use this wrapper function since the auth session data is not cached by default
async function getCachedSessionData(sessionData: Session) {
  addAuthCacheTags(sessionData.user.id);

  // Simulate a loading delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return sessionData;
}

const SuspensePreviewContent = async () => {
  const sessionData = await auth();
  if (!sessionData) {
    return null;
  }
  const session = await getCachedSessionData(sessionData);

  return <PreviewContent session={session} />;
};

// Error fallback component
async function ErrorFallbackComponent() {
  "use server";

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
      <h2 className="mb-4 font-semibold text-2xl">预览加载错误</h2>
      <p className="mb-6 max-w-md text-neutral-600 dark:text-neutral-400">
        预览内容过大或包含无效数据，无法正常显示。请尝试减小HTML/CSS内容大小或检查内容格式。
      </p>
      <a
        href="/"
        className="rounded-md bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        返回首页
      </a>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <ErrorBoundary FallbackComponent={ErrorFallbackComponent}>
        <Suspense fallback={<LoadingSpinner />}>
          <SuspensePreviewContent />
        </Suspense>
      </ErrorBoundary>
      <Footer />
    </div>
  );
}
