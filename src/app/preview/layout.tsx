import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth-server'

// Define fonts
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'HTML 预览',
  description: '预览 HTML 模板',
}

export default async function PreviewLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession()

  if (!session) {
    redirect('/signin')
  }

  return (
    <div className={`preview-layout ${inter.variable} ${playfair.variable} font-sans`}>
      {children}
    </div>
  )
}
