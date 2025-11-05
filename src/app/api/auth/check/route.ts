import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Check for auth token in cookies or headers
    const cookieToken = request.cookies.get('authToken')?.value;
    const headerToken = request.headers.get('authorization')?.replace('Bearer ', '');
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json({
        authenticated: false,
        error: 'No token found',
        hasCookie: false,
        hasHeader: false
      }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key') as any;

    return NextResponse.json({
      authenticated: true,
      user: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      },
      hasCookie: !!cookieToken,
      hasHeader: !!headerToken,
      tokenSource: cookieToken ? 'cookie' : 'header'
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      authenticated: false,
      error: 'Invalid token',
      hasCookie: !!request.cookies.get('authToken')?.value,
      hasHeader: !!request.headers.get('authorization')
    }, { status: 401 });
  }
}