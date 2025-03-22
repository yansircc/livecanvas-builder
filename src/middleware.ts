import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 检查cookie名称
const SESSION_COOKIE_NAMES = [
  'next-auth.session-token',
  'lc_builder_session',
  '__session',
  '__Secure-next-auth.session-token',
  'next-auth.callback-url',
  'next-auth.csrf-token',
  '__Secure-lc_builder_session',
  'better-auth.session_token',
]

/**
 * 保护路由的中间件 - 修复重定向循环问题
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 检查是否在登录或注册页面
  const isAuthPage = pathname === '/signin' || pathname === '/signup'
  if (isAuthPage) {
    // 如果已登录，重定向到仪表板
    const hasAuthCookie = checkSessionCookies(request)

    if (hasAuthCookie) {
      // 已登录但在登录页面，重定向到仪表板
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 未登录，继续访问登录页
    return NextResponse.next()
  }

  // 添加对根路径的检查 - 如果已登录则重定向到仪表板
  if (pathname === '/') {
    const hasAuthCookie = checkSessionCookies(request)

    if (hasAuthCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 未登录，允许访问根路径
    return NextResponse.next()
  }

  // 保护页面路由
  const protectedPageRoutes = ['/dashboard', '/gallery', '/preview', '/profile', '/wizard']

  // 检查是否是受保护页面
  let isProtectedPage = false
  for (const route of protectedPageRoutes) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      isProtectedPage = true
      break
    }
  }

  if (isProtectedPage) {
    console.log('[Middleware] Protected page detected')

    // 检查所有可能的会话cookie
    const hasAuthCookie = checkSessionCookies(request)

    if (!hasAuthCookie) {
      // 没有找到有效会话，重定向到登录页
      console.log('[Middleware] No auth cookie found, redirecting to signin')
      const signInUrl = new URL('/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }

    console.log('[Middleware] Auth cookie found, allowing access to protected page')
    // 有会话cookie，允许访问
    return NextResponse.next()
  }

  // 保护API路由
  const protectedApiPrefixes = ['/api/protected', '/api/chat', '/api/user']

  let isProtectedApi = false
  for (const prefix of protectedApiPrefixes) {
    if (pathname.startsWith(prefix)) {
      isProtectedApi = true
      break
    }
  }

  if (isProtectedApi) {
    // 检查Authorization头
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      return NextResponse.next()
    }

    // 检查会话cookie
    const hasAuthCookie = checkSessionCookies(request)

    if (!hasAuthCookie) {
      return new NextResponse(
        JSON.stringify({ error: '未授权访问', details: '缺少有效的身份验证' }),
        {
          status: 401,
          headers: { 'content-type': 'application/json' },
        },
      )
    }

    return NextResponse.next()
  }

  // 默认允许继续
  return NextResponse.next()
}

// 辅助函数：检查是否有任何会话cookie存在
function checkSessionCookies(request: NextRequest): boolean {
  // 检查所有可能的会话cookie
  for (const cookieName of SESSION_COOKIE_NAMES) {
    const cookie = request.cookies.get(cookieName)
    if (cookie) {
      console.log(`[Middleware] Found auth cookie: ${cookieName}`)
      return true
    }
  }

  console.log('[Middleware] No auth cookies found')
  return false
}

// 中间件配置
export const config = {
  // 匹配所有路由，但排除静态资源
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.ico).*)'],
}
