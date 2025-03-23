"use server";

import type { Session } from "next-auth";
import { unstable_cacheTag as cacheTag, revalidateTag } from "next/cache";

/**
 * 获取缓存会话数据
 * @param sessionData 会话数据
 * @returns 返回会话数据
 */
export async function getCachedSessionData(sessionData: Session | null) {
	"use cache";
	cacheTag("user-profile");

	// 模拟一个加载延迟
	await new Promise((resolve) => setTimeout(resolve, 1500));
	return sessionData;
}

// 添加重新验证 auth 缓存的功能
export async function revalidateUserProfile() {
	revalidateTag("user-profile");
}
