import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  RandomErrorFallback,
  RandomLoadingFallback,
  SuspenseRandomNumber,
} from "./components/random-number/suspense";
import {
  SuspenseUserProfile,
  UserErrorFallback,
  UserLoadingFallback,
} from "./components/user-profile/suspense";

export default function HomePage() {
  return (
    <div className="container mx-auto flex min-h-screen max-w-screen-lg flex-col items-center justify-center p-4">
      <h1 className="mb-8 text-center font-bold text-3xl">高级组件设计演示</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* 随机数部分 */}
        <section aria-labelledby="random-number-title">
          <h2 id="random-number-title" className="mb-4 font-semibold text-xl">
            随机数服务
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            此组件使用 "use cache" 和 cacheTag
            实现数据缓存，点击按钮可重新验证缓存。
          </p>
          <ErrorBoundary
            fallback={
              <RandomErrorFallback error={new Error("随机数服务加载失败")} />
            }
          >
            <Suspense fallback={<RandomLoadingFallback />}>
              <SuspenseRandomNumber />
            </Suspense>
          </ErrorBoundary>
        </section>

        {/* 用户资料部分 */}
        <section aria-labelledby="user-profile-title">
          <h2 id="user-profile-title" className="mb-4 font-semibold text-xl">
            用户资料服务
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            此组件需要登录才能查看完整内容，同样使用了缓存机制。
          </p>
          <ErrorBoundary
            fallback={
              <UserErrorFallback error={new Error("用户资料服务加载失败")} />
            }
          >
            <Suspense fallback={<UserLoadingFallback />}>
              <SuspenseUserProfile />
            </Suspense>
          </ErrorBoundary>
        </section>
      </div>

      <div className="mt-12 text-center">
        <a
          href="/test/error-demo"
          className="inline-block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          查看错误边界演示
        </a>
      </div>
    </div>
  );
}
