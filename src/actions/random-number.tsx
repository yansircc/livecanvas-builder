"use server";

import { unstable_cacheTag as cacheTag } from "next/cache";
import { revalidateTag } from "next/cache";

/**
 * 模拟获取远程数据
 * @returns 异步返回数据
 */
export async function getCachedRandomNumber() {
  "use cache";
  cacheTag("random-number");

  // 模拟获取远程数据
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return Math.random();
}

/**
 * 重新验证随机数
 */
export async function revalidateRandomNumber() {
  "use server";
  revalidateTag("random-number");
}
