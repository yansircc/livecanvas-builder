import { getCachedSessionData, revalidateAuthSession } from "@/actions/user";
import { LoginForm } from "@/components/login-form";
import { LogoutButton } from "@/components/logout-button";
import { auth } from "@/server/auth";

/**
 * 异步组件
 * @returns 返回主UI
 */
export async function SuspenseAuthComponent() {
  // 先获取会话数据
  const sessionData = await auth();
  // 然后将其传递给缓存函数
  const session = await getCachedSessionData(sessionData);

  return (
    <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-gray-900">
      {session ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {session.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name ?? "User"}
                className="h-10 w-10 rounded-full"
              />
            )}
            <div>
              <p className="font-medium">{session.user?.name}</p>
              <p className="text-gray-500 text-sm">{session.user?.email}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <LogoutButton />
            <form action={revalidateAuthSession}>
              <button
                type="submit"
                className="inline-flex h-10 w-full items-center justify-center rounded-md bg-blue-500 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              >
                刷新会话缓存
              </button>
            </form>
          </div>
        </div>
      ) : (
        <LoginForm />
      )}
    </div>
  );
}

/**
 * 获取用户加载中
 * @returns 返回加载中UI
 */
export async function UserFallback() {
  return <p>加载中...</p>;
}
