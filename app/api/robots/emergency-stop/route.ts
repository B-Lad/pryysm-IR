// Emergency Stop API - Critical Safety Function

import { NextRequest, NextResponse } from 'next/server';
import { RobotService } from '@/src/lib/robots/RobotService';
import { requireEmergencyAuth, checkRateLimit } from '@/src/middleware/auth';

/**
 * POST /api/robots/emergency-stop - Trigger emergency stop for all robots
 * This is a critical safety function - requires authentication and rate limiting
 */
export async function POST(request: NextRequest) {
  try {
    // Security: Require authentication for emergency stop
    const authError = await requireEmergencyAuth(request);
    if (authError) {
      console.warn('[SECURITY] Unauthorized emergency stop attempt');
      return authError;
    }

    // Security: Rate limit emergency stops to prevent abuse
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(`emergency-stop:${clientIP}`, 3, 60000)) {
      console.warn(`[SECURITY] Rate limit exceeded for emergency-stop from ${clientIP}`);
      return NextResponse.json(
        { error: 'Rate limit exceeded. Too many emergency stop attempts.', code: 'RATE_LIMITED' },
        { status: 429 }
      );
    }

    console.log('⚠️ EMERGENCY STOP TRIGGERED ⚠️');
    console.log(`[SECURITY] User: ${(request as any).user?.email} initiated emergency stop`);
    
    // Execute emergency stop on all robots
    await RobotService.emergencyStopAll();

    // Log the emergency stop event with user info
    try {
      const { prisma } = await import('@/src/lib/prisma');
      const robots = await prisma.robotConfig.findMany({ where: { isActive: true } });
      
      for (const robot of robots) {
        await prisma.robotEvent.create({
          data: {
            robotId: robot.id,
            eventType: 'EMERGENCY_STOP',
            message: `Emergency stop triggered by user: ${(request as any).user?.email}`,
            data: { userId: (request as any).user?.id, ip: clientIP }
          }
        });
      }
    } catch (logError) {
      console.error('[ERROR] Failed to log emergency stop event:', logError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'EMERGENCY STOP ACTIVATED - All robots stopped',
      timestamp: new Date().toISOString(),
      triggeredBy: (request as any).user?.email
    });
  } catch (error) {
    console.error('[API] Emergency stop error:', error);
    return NextResponse.json(
      { 
        error: 'Emergency stop failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/robots/emergency-stop - Get emergency stop status
 */
export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Check for recent emergency stop events
    const recentEvents = await prisma.robotEvent.findMany({
      where: {
        eventType: 'EMERGENCY_STOP',
        timestamp: {
          gte: new Date(Date.now() - 3600000) // Last hour
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 10
    });

    return NextResponse.json({
      success: true,
      data: {
        hasRecentEmergencyStops: recentEvents.length > 0,
        recentEvents: recentEvents.map(e => ({
          robotId: e.robotId,
          timestamp: e.timestamp,
          message: e.message
        }))
      }
    });
  } catch (error) {
    console.error('[API] Error getting emergency stop status:', error);
    return NextResponse.json(
      { error: 'Failed to get status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
