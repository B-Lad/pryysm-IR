// Health Check API Route
import { NextResponse } from 'next/server';
import { ensurePrismaConnected } from '@/src/lib/prisma';
import { robotFactory } from '@/src/lib/robots/RobotFactory';

/**
 * GET /api/health - System health check
 */
export async function GET() {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      robots: 'unknown',
    },
    details: {
      robotCount: 0,
      queueSize: 0,
    }
  };

  // Check database connection
  try {
    await ensurePrismaConnected(1);
    healthStatus.services.database = 'connected';
  } catch (error) {
    healthStatus.services.database = 'disconnected';
    healthStatus.status = 'degraded';
  }

  // Check robot factory
  try {
    const robots = robotFactory.getAllRobots();
    const queueStatus = robotFactory.getQueueStatus();
    
    healthStatus.details.robotCount = robots.size;
    healthStatus.details.queueSize = queueStatus.pending;
    healthStatus.services.robots = 'operational';
  } catch (error) {
    healthStatus.services.robots = 'error';
    healthStatus.status = 'degraded';
  }

  // Determine overall status
  if (healthStatus.services.database === 'disconnected' || 
      healthStatus.services.robots === 'error') {
    healthStatus.status = 'unhealthy';
  }

  return NextResponse.json(healthStatus, { 
    status: healthStatus.status === 'healthy' ? 200 : 503 
  });
}
