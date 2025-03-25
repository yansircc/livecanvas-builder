import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 检查会话是否有效
function isValidSession(request: NextRequest): boolean {
  // 从 Cookie 中获取 session token
  const sessionToken = request.cookies.get("authjs.session-token")?.value;
  return Boolean(sessionToken);
}

export async function middleware(request: NextRequest) {
  // 1. 检查 session
  const session = isValidSession(request);

  const publicPaths = ["/signin", "/register", "/reset-password"];
  const authPaths = ["/profile", "/gallery", "/preview", "/wizard"];
  const currentPath = request.nextUrl.pathname;

  // 2. 快速路径判断
  const isPublicPath = publicPaths.some((path) => currentPath.startsWith(path));
  const isAuthPath = authPaths.some((path) => currentPath.startsWith(path));
  const isRootPath = currentPath === "/";

  // 3. 权限控制逻辑
  if (session) {
    // 已登录用户访问根路径或公共页面时重定向到 dashboard
    if (isRootPath || isPublicPath) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // 已登录用户访问其他页面，允许访问
    const response = NextResponse.next();
    // 可以在响应头中添加用户认证状态，供前端使用
    response.headers.set("x-user-authenticated", "true");
    return response;
  }

  // 未登录用户只能访问公共页面和根路径
  if (!isPublicPath && !isRootPath) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // 未登录用户访问公共页面或根路径，允许访问
  return NextResponse.next();
}

export const config = {
  matcher: [
    // 定义需要中间件处理的路径
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
