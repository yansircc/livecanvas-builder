import { Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface AuthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  showGithub?: boolean
  showGoogle?: boolean
}

export default function SignInCard({
  showGithub = false,
  showGoogle = false,
  className,
  ...props
}: AuthCardProps) {
  return (
    <Card
      className={cn(
        'mx-auto w-[400px] rounded-3xl',
        'bg-white dark:bg-[#121212]',
        'border-2 border-zinc-100 dark:border-zinc-800/50',
        'shadow-[0_24px_48px_-12px] shadow-zinc-900/10 dark:shadow-black/30',
        className,
      )}
      {...props}
    >
      <CardHeader className="space-y-4 px-8 pt-10">
        <div className="space-y-2 text-center">
          <CardTitle className="bg-linear-to-r from-zinc-800 to-zinc-600 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:to-zinc-400">
            Welcome back
          </CardTitle>
          <CardDescription className="text-base text-zinc-500 dark:text-zinc-400">
            Sign in to your account
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-8 pt-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Email address"
              className="h-12 border-zinc-200 bg-zinc-50 dark:border-zinc-800/50 dark:bg-[#1a1a1a]"
            />
            <Input
              type="password"
              placeholder="Password"
              className="h-12 border-zinc-200 bg-zinc-50 dark:border-zinc-800/50 dark:bg-[#1a1a1a]"
            />
            <Button className="group relative h-12 w-full overflow-hidden bg-linear-to-r from-zinc-900 to-zinc-800 font-medium text-white shadow-lg shadow-zinc-200/20 transition-all duration-300 hover:from-indigo-500 hover:to-indigo-700 dark:from-white dark:to-zinc-200 dark:text-[#121212] dark:shadow-black/20 dark:hover:from-indigo-400 dark:hover:to-indigo-600">
              Sign in
            </Button>
          </div>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-200 dark:border-zinc-800/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 font-medium text-zinc-400 dark:bg-[#121212] dark:text-zinc-500">
                Or continue with
              </span>
            </div>
          </div>

          {showGoogle && (
            <Button
              variant="outline"
              className="group relative h-12 border-zinc-200 bg-zinc-50 ring-1 ring-zinc-100 transition duration-200 hover:border-zinc-300 hover:bg-white dark:border-zinc-800/50 dark:bg-[#1a1a1a] dark:ring-zinc-800/50 dark:hover:border-zinc-700 dark:hover:bg-[#222222]"
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
              </svg>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                Continue with Google
              </span>
            </Button>
          )}

          {showGithub && (
            <Button
              variant="outline"
              className="group relative h-12 border-zinc-200 bg-zinc-50 ring-1 ring-zinc-100 transition duration-200 hover:border-zinc-300 hover:bg-white dark:border-zinc-800/50 dark:bg-[#1a1a1a] dark:ring-zinc-800/50 dark:hover:border-zinc-700 dark:hover:bg-[#222222]"
            >
              <Github className="mr-2 h-5 w-5 text-zinc-700 dark:text-zinc-300" />
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                Continue with GitHub
              </span>
            </Button>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-8 pt-2 pb-10">
        <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          By continuing, you agree to our{' '}
          <a
            href="#"
            className="font-medium text-zinc-800 underline decoration-zinc-200 underline-offset-4 transition-colors hover:text-zinc-600 dark:text-white dark:decoration-zinc-700 dark:hover:text-zinc-200"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="#"
            className="font-medium text-zinc-900 underline decoration-zinc-200 underline-offset-4 transition-colors hover:text-zinc-600 dark:text-white dark:decoration-zinc-700 dark:hover:text-zinc-200"
          >
            Privacy Policy
          </a>
        </div>
      </CardFooter>
    </Card>
  )
}
