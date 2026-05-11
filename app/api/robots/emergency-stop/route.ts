// Emergency Stop API - Critical Safety Function

import { NextRequest, NextResponse } from 'next/server';
import { RobotService } from '@/src/lib/robots/RobotService';

/**
 * POST /api/robots/emergency-stop - Trigger emergency stop for all robots
 * This is a critical safety function
 */
export async function POST(request: NextRequest) {
  try {
    console.log('⚠️ EMERGENCY STOP TRIGGERED ⚠️');
    
    // Execute emergency stop on all robots
    await RobotService.emergencyStopAll();

    return NextResponse.json({ 
      success: true, 
      message: 'EMERGENCY STOP ACTIVATED - All robots stopped',
      timestamp: new Date().toISOString()
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
