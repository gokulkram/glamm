import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isAdmin = !!user?.email && adminEmails().includes(user.email.toLowerCase())

  // ---- Admin area (allowlisted emails only) ----
  if (path.startsWith('/admin')) {
    const isLogin = path === '/admin/login'
    if (!isLogin && !isAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      url.searchParams.set('next', path)
      return NextResponse.redirect(url)
    }
    if (isLogin && isAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      url.search = ''
      return NextResponse.redirect(url)
    }
    return response
  }

  // ---- Customer account area (any signed-in user) ----
  if (path.startsWith('/account')) {
    const isAuthPage = path === '/account/login' || path === '/account/register'
    if (!isAuthPage && !user) {
      const url = request.nextUrl.clone()
      url.pathname = '/account/login'
      url.searchParams.set('next', path)
      return NextResponse.redirect(url)
    }
    if (isAuthPage && user) {
      const url = request.nextUrl.clone()
      url.pathname = '/account'
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  // ---- Checkout requires login ----
  if (path.startsWith('/checkout') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/account/login'
    url.searchParams.set('next', '/checkout')
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/checkout/:path*'],
}
