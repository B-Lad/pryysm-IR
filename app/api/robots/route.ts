// Robot Control API Routes

import { NextRequest, NextResponse } from 'next/server';
import { robotFactory } from '@/src/lib/robots/RobotFactory';
import { RobotService } from '@/src/lib/robots/RobotService';
import { RobotConfig } from '@/src/lib/robots/types';

/**
 * GET /api/robots - Get all robots status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const robotId = searchParams.get('id');

    if (robotId) {
      // Get single robot status
      const status = await RobotService.getRobotStatus(robotId);
      if (!status) {
        return NextResponse.json(
          { error: 'Robot not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: status });
    } else {
      // Get all robots status
      const allStatuses = await RobotService.getAllRobotsStatus();
      const statusesArray = Array.from(allStatuses.entries()).map(([id, status]) => ({
        id,
        ...status
      }));

      return NextResponse.json({ 
        success: true, 
        data: statusesArray,
        queueStatus: robotFactory.getQueueStatus()
      });
    }
  } catch (error) {
    console.error('[API] Error getting robot status:', error);
    return NextResponse.json(
      { error: 'Failed to get robot status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/robots - Register a new robot
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const config: Omit<RobotConfig, 'id'> = {
      name: body.name,
      vendor: body.vendor,
      model: body.model,
      ipAddress: body.ipAddress,
      port: body.port,
      protocol: body.protocol,
      stationId: body.stationId,
      isActive: body.isActive ?? true
    };

    const robot = await RobotService.registerRobot(config);
    
    return NextResponse.json({ 
      success: true, 
      data: robot,
      message: 'Robot registered successfully'
    });
  } catch (error) {
    console.error('[API] Error registering robot:', error);
    return NextResponse.json(
      { error: 'Failed to register robot', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/robots - Remove a robot
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const robotId = searchParams.get('id');

    if (!robotId) {
      return NextResponse.json(
        { error: 'Robot ID required' },
        { status: 400 }
      );
    }

    await RobotService.removeRobot(robotId);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Robot removed successfully'
    });
  } catch (error) {
    console.error('[API] Error removing robot:', error);
    return NextResponse.json(
      { error: 'Failed to remove robot', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
