import {
  FallbackRandomNumber,
  SuspenseRandomNumber,
} from "@/app/suspense-components/random-number";
import {
  SuspenseAuthComponent,
  UserFallback,
} from "@/app/suspense-components/user";
import { Suspense } from "react";

export default async function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <div className="flex flex-col items-center gap-2">
        <h2 className="font-bold text-xl">随机数缓存测试</h2>
        <p className="mb-2 text-gray-500">缓存时间: 2秒</p>
        <Suspense fallback={<FallbackRandomNumber />}>
          <SuspenseRandomNumber />
        </Suspense>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-center font-bold text-xl">认证会话缓存测试</h2>
        <p className="mb-4 text-center text-gray-500">缓存时间: 1.5秒</p>
        <Suspense fallback={<UserFallback />}>
          <SuspenseAuthComponent />
        </Suspense>
      </div>
    </main>
  );
}
