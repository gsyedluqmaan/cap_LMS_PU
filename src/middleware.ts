import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

interface DecodedToken {
  userId: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Allow public routes
  const publicPaths = ['/', '/login', '/register', '/api/auth/login', '/api/auth/register']
  if (publicPaths.some(path => pathname === path || pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check authentication for protected routes
  const cookieToken = request.cookies.get('authToken')?.value
  const headerToken = request.headers.get('authorization')?.replace('Bearer ', '')
  const token = cookieToken || headerToken

  // Debug logging
  console.log('Middleware Debug:', {
    pathname,
    hasCookieToken: !!cookieToken,
    hasHeaderToken: !!headerToken,
    finalToken: !!token
  })

  if (!token) {
    console.log('No token found, redirecting to login')
    // Redirect to login for browser requests
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Return 401 for API requests
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key') as DecodedToken
    console.log('Token verified successfully:', { userId: decoded.userId, role: decoded.role })
    
    // Admin-only routes
    const adminOnlyPaths = ['/dashboard/students', '/dashboard/teachers']
    if (adminOnlyPaths.some(path => pathname.startsWith(path)) && decoded.role !== 'admin') {
      console.log('Admin route access denied:', { path: pathname, role: decoded.role })
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Online classes route - allow all authenticated users (admin, teacher, student)
    // Students can view their enrolled classes, teachers can manage their classes, admins can manage all
    const onlineClassesPaths = ['/dashboard/online-classes']
    if (onlineClassesPaths.some(path => pathname.startsWith(path)) && 
        !['admin', 'teacher', 'student'].includes(decoded.role)) {
      console.log('Online classes route access denied:', { path: pathname, role: decoded.role })
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Calendar route - allow all authenticated users (admin, teacher, student)
    // Note: Edit permissions will be handled in the frontend based on role
    console.log('Access granted:', { path: pathname, role: decoded.role })

    // Add user info to headers for API routes
    const response = NextResponse.next()
    response.headers.set('x-user-id', decoded.userId)
    response.headers.set('x-user-role', decoded.role)
    response.headers.set('x-user-email', decoded.email)
    
    return response
  } catch (error) {
    console.log('Token verification failed:', error)
    // Invalid token - redirect to login
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}