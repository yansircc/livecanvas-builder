"use server";

import { auth } from "@/server/auth";
import type { Session } from "next-auth";
import { unstable_cacheTag as cacheTag } from "next/cache";

/**
 * 带缓存的随机数函数
 * @param isLoggedIn 是否已登录
 * @param userId 用户ID (可选)
 */
export async function getCachedRandomNumber(session: Session | null) {
	"use cache";
	cacheTag("random-number");

	if (!session) {
		return { randomNumber: 0, session };
	}

	// 模拟获取远程数据
	await new Promise((resolve) => setTimeout(resolve, 2000));
	return { randomNumber: Math.random(), session };
}

/**
 * 包装函数，处理认证逻辑
 */
export async function authWrapper() {
	const session = await auth();
	return session;
}

/**
 * 包装函数，处理认证逻辑
 * @params callback 回调函数
 */
export async function getRandomNumberWithAuth() {
	const session = await authWrapper();

	// 然后将信息传递给缓存函数
	return getCachedRandomNumber(session);
}
