import {
  getCachedRandomNumber,
  revalidateRandomNumber,
} from "@/actions/random-number";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 异步组件
 * @returns 返回主UI
 */
export async function SuspenseRandomNumber() {
  const randomNumber = await getCachedRandomNumber();
  return (
    <div className="mt-4 flex items-center gap-2 rounded bg-gray-100 p-2 font-mono dark:bg-gray-800">
      {randomNumber}
      <form action={revalidateRandomNumber}>
        <button
          className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          type="submit"
        >
          重新验证随机数
        </button>
      </form>
    </div>
  );
}

/**
 * 默认加载组件
 * @returns 返回加载中UI
 */
export async function FallbackRandomNumber() {
  return <Skeleton className="h-10 w-full" />;
}
