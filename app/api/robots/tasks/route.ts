// Robot Task Management API

import { NextRequest, NextResponse } from 'next/server';
import { RobotService } from '@/src/lib/robots/RobotService';

/**
 * GET /api/robots/tasks - Get tasks
 * Query params: printerId (optional), taskId (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const printerId = searchParams.get('printerId');
    const taskId = searchParams.get('taskId');

    if (taskId) {
      // Get single task
      const task = await RobotService.getTask(taskId);
      if (!task) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: task });
    }

    if (printerId) {
      // Get tasks for specific printer
      const tasks = await RobotService.getPrinterTasks(printerId);
      return NextResponse.json({ success: true, data: tasks });
    }

    // Get recent tasks from all printers
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const tasks = await prisma.robotTask.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error('[API] Error getting tasks:', error);
    return NextResponse.json(
      { error: 'Failed to get tasks', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/robots/tasks - Create a new task
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { robotId, printerId, taskType, priority, parameters } = body;

    if (!robotId || !printerId || !taskType) {
      return NextResponse.json(
        { error: 'Missing required fields: robotId, printerId, taskType' },
        { status: 400 }
      );
    }

    const validTaskTypes = ['PART_REMOVAL', 'BED_PREP', 'INSPECTION', 'MATERIAL_LOAD'];
    if (!validTaskTypes.includes(taskType)) {
      return NextResponse.json(
        { error: `Invalid task type. Must be one of: ${validTaskTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const task = await RobotService.createTask({
      robotId,
      printerId,
      taskType: taskType as any,
      priority: priority || 5,
      parameters: parameters || {}
    });

    return NextResponse.json({ 
      success: true, 
      data: task,
      message: 'Task created and queued successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/robots/tasks - Update task status
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, status, errorMessage } = body;

    if (!taskId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: taskId, status' },
        { status: 400 }
      );
    }

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const updatedTask = await RobotService.updateTaskStatus(
      taskId, 
      status as any, 
      errorMessage
    );

    return NextResponse.json({ 
      success: true, 
      data: updatedTask,
      message: 'Task status updated successfully'
    });
  } catch (error) {
    console.error('[API] Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
