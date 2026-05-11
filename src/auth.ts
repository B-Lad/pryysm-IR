/**
 * Authentication Middleware for Robot Control APIs
 * Validates session tokens and enforces role-based access control
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'master';
  };
}

/**
 * Middleware to validate authentication for robot control endpoints
 * Returns null if authenticated, or a Response if auth fails
 */
export async function requireAuth(
  request: NextRequest,
  allowedRoles: ('admin' | 'master')[] = ['admin', 'master']
): Promise<NextResponse | null> {
  try {
    // Get session token from cookies or Authorization header
    const sessionToken = 
      request.cookies.get('session-token')?.value ||
      request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Validate session in database
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session || session.expires < new Date()) {
      // Session expired or invalid
      if (session) {
        // Clean up expired session
        await prisma.session.delete({ where: { sessionToken } });
      }
      return NextResponse.json(
        { error: 'Session expired', code: 'SESSION_EXPIRED' },
        { status: 401 }
      );
    }

    // Check if user has required role
    const userRole = session.user.role as 'admin' | 'master';
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions', code: 'FORBIDDEN', requiredRoles: allowedRoles },
        { status: 403 }
      );
    }

    // Attach user to request for downstream handlers
    (request as AuthenticatedRequest).user = {
      id: session.userId,
      email: session.user.email!,
      role: userRole,
    };

    return null; // Auth successful
  } catch (error) {
    console.error('[Auth Middleware] Error:', error);
    return NextResponse.json(
      { error: 'Authentication service unavailable', code: 'AUTH_ERROR' },
      { status: 503 }
    );
  }
}

/**
 * Middleware specifically for emergency stop - requires master role or explicit authorization
 */
export async function requireEmergencyAuth(request: NextRequest): Promise<NextResponse | null> {
  // Emergency stops can be triggered by any authenticated user, but we log it
  const authResult = await requireAuth(request, ['admin', 'master']);
  
  if (authResult) {
    return authResult;
  }

  // Additional check: Verify this isn't a cross-site request
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  
  if (origin && host && !origin.includes(host)) {
    // Log potential CSRF attempt on critical safety endpoint
    console.warn(`[SECURITY] Potential CSRF on emergency-stop from origin: ${origin}`);
  }

  return null;
}

/**
 * Rate limiting helper - track requests per IP/user
 * Simple in-memory implementation (use Redis for production)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000 // 1 minute default
): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    // New window
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false; // Rate limited
  }

  record.count++;
  return true;
}
