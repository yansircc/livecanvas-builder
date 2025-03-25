import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { login } from "../actions";

export default function SignIn() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card
        className={cn(
          "mx-auto w-fit rounded-3xl",
          "bg-white dark:bg-[#121212]",
          "border-2 border-zinc-100 dark:border-zinc-800/50",
          "shadow-[0_24px_48px_-12px] shadow-zinc-900/10 dark:shadow-black/30"
        )}
      >
        <CardHeader className="space-y-4 px-8 pt-10">
          <div className="space-y-2 text-center">
            <CardTitle className="bg-linear-to-r from-zinc-800 to-zinc-600 bg-clip-text font-bold text-2xl text-transparent dark:from-white dark:to-zinc-400">
              欢迎回来
            </CardTitle>
            <CardDescription className="text-base text-zinc-500 dark:text-zinc-400">
              请选择你喜欢的登录方式
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-8 pt-4">
          <div className="grid grid-cols-1 gap-3">
            <form
              action={async () => {
                "use server";
                await login("google", { callbackUrl: "/profile" });
              }}
            >
              <Button
                type="submit"
                variant="outline"
                className="group relative h-12 w-full border-zinc-200 bg-zinc-50 ring-1 ring-zinc-100 transition duration-200 hover:border-zinc-300 hover:bg-white dark:border-zinc-800/50 dark:bg-[#1a1a1a] dark:ring-zinc-800/50 dark:hover:border-zinc-700 dark:hover:bg-[#222222]"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <title>Google</title>
                </svg>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  使用 Google 登录
                </span>
              </Button>
            </form>

            <form
              action={async () => {
                "use server";
                await login("discord", { callbackUrl: "/profile" });
              }}
            >
              <Button
                type="submit"
                variant="outline"
                className="group relative h-12 w-full border-zinc-200 bg-zinc-50 ring-1 ring-zinc-100 transition duration-200 hover:border-zinc-300 hover:bg-white dark:border-zinc-800/50 dark:bg-[#1a1a1a] dark:ring-zinc-800/50 dark:hover:border-zinc-700 dark:hover:bg-[#222222]"
              >
                <svg
                  className="mr-2 h-5 w-5 text-[#5865F2]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-label="Discord logo"
                >
                  <title>Discord logo</title>
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  使用 Discord 登录
                </span>
              </Button>
            </form>
          </div>
        </CardContent>

        <CardFooter className="px-8 pt-2 pb-10">
          <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            登录即表示您同意我们的{" "}
            <a
              href="/terms-of-service"
              className="font-medium text-zinc-800 underline decoration-zinc-200 underline-offset-4 transition-colors hover:text-zinc-600 dark:text-white dark:decoration-zinc-700 dark:hover:text-zinc-200"
            >
              服务条款
            </a>{" "}
            和{" "}
            <a
              href="/privacy-policy"
              className="font-medium text-zinc-800 underline decoration-zinc-200 underline-offset-4 transition-colors hover:text-zinc-600 dark:text-white dark:decoration-zinc-700 dark:hover:text-zinc-200"
            >
              隐私政策
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
