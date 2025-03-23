"use server";

import { LoginForm } from "@/components/login-form";
import { LogoutButton } from "@/components/logout-button";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/server/auth";
import type { Session } from "next-auth";
import { unstable_cacheTag as cacheTag, revalidateTag } from "next/cache";

/**
 * 获取缓存会话数据
 * @param sessionData 会话数据
 * @returns 返回会话数据
 */
export async function getCachedSessionData(sessionData: Session | null) {
  "use cache";
  cacheTag("auth-session");

  // 模拟一个加载延迟
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return sessionData;
}

// 添加重新验证 auth 缓存的功能
export async function revalidateAuthSession() {
  "use server";

  revalidateTag("auth-session");
}
