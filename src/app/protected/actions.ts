"use server";

import type { Session } from "next-auth";
import { unstable_cacheLife as cacheLife } from "next/cache";

/**
 * 获取缓存会话数据
 * @param sessionData 会话数据
 * @returns 返回会话数据
 */
export async function getCachedSessionData(sessionData: Session | null) {
	"use cache";
	cacheLife("minutes");

	// 模拟一个加载延迟
	await new Promise((resolve) => setTimeout(resolve, 1500));
	return sessionData;
}
