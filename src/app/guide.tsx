// app/cache-examples/page.tsx
import { auth } from "@/server/auth";
import type { Session } from "next-auth";
import { unstable_cacheTag as cacheTag, revalidateTag } from "next/cache";

// ✅ 简单值的缓存 - 没有动态数据依赖，可以直接缓存
async function getCachedValue() {
  "use cache";
  cacheTag("simple-value");

  await new Promise((resolve) => setTimeout(resolve, 1000)); // 模拟延迟
  return Math.random();
}

// ❌ 错误方式 - 在缓存函数内直接使用动态数据源
// 这会导致错误，因为auth()可能内部使用了cookies()或headers()
async function getSessionDirectly() {
  "use cache"; // 这会产生错误
  cacheTag("session-direct");

  return await auth(); // 不要这样做！
}

// ✅ 正确方式 - 两步法
// 1. 定义接收数据的缓存函数
async function cacheSessionData(sessionData: Session) {
  "use cache";
  cacheTag("session-proper");

  await new Promise((resolve) => setTimeout(resolve, 1000)); // 模拟延迟
  return sessionData;
}

// 重置缓存的服务器动作
async function invalidateCache(tag: string) {
  "use server";
  revalidateTag(tag);
}

export default async function CacheExamplesPage() {
  // 获取简单缓存值
  const randomValue = await getCachedValue();

  // 2. 先获取动态数据，再传给缓存函数
  const sessionData = await auth();
  if (!sessionData) {
    return <div>未登录</div>;
  }
  const cachedSession = await cacheSessionData(sessionData);

  return (
    <div>
      <h1>缓存示例</h1>

      <section>
        <h2>简单值缓存</h2>
        <p>缓存的随机数: {randomValue}</p>
        <form action={() => invalidateCache("simple-value")}>
          <button type="submit">刷新值</button>
        </form>
      </section>

      <section>
        <h2>会话数据缓存</h2>
        <p>用户: {cachedSession?.user?.name || "未登录"}</p>
        <form action={() => invalidateCache("session-proper")}>
          <button type="submit">刷新会话缓存</button>
        </form>
      </section>
    </div>
  );
}
