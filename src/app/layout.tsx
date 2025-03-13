import '@/styles/globals.css'
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import { CacheInitializer } from '@/components/cache-initializer'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'LiveCanvas Builder',
  description: 'Generate beautiful UI with AI',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background min-h-screen font-sans antialiased">
        <CacheInitializer />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
