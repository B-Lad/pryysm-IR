/**
 * Robot Service - Business logic layer for robot operations
 * Integrates with database and provides API-ready functions
 */

import { robotFactory } from './RobotFactory';
import { RobotConfig, RobotTask, RobotStatus } from './types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RobotService {
  /**
   * Initialize robots from database configuration
   */
  static async initializeRobots(): Promise<void> {
    try {
      const robotConfigs = await prisma.robotConfig.findMany({
        where: { isActive: true }
      });

      for (const config of robotConfigs) {
        robotFactory.createRobot({
          id: config.id,
          name: config.name,
          vendor: config.vendor as any,
          model: config.model,
          ipAddress: config.ipAddress,
          port: config.port,
          protocol: config.protocol as any,
          stationId: config.stationId,
          isActive: config.isActive
        });
      }

      console.log(`[RobotService] Initialized ${robotConfigs.length} robots`);
      
      // Connect to all robots
      const results = await robotFactory.connectAllRobots();
      
      for (const [id, success] of results) {
        console.log(`[RobotService] Robot ${id} connection: ${success ? 'SUCCESS' : 'FAILED'}`);
      }
    } catch (error) {
      console.error('[RobotService] Failed to initialize robots:', error);
    }
  }

  /**
   * Create a new robot task
   */
  static async createTask(taskData: {
    robotId: string;
    printerId: string;
    taskType: 'PART_REMOVAL' | 'BED_PREP' | 'INSPECTION' | 'MATERIAL_LOAD';
    priority?: number;
    parameters?: any;
  }): Promise<RobotTask> {
    const task = await prisma.robotTask.create({
      data: {
        robotId: taskData.robotId,
        printerId: taskData.printerId,
        taskType: taskData.taskType,
        status: 'PENDING',
        priority: taskData.priority || 5,
        parameters: taskData.parameters || {}
      }
    });

    // Add to robot factory queue
    robotFactory.addTask({
      id: task.id,
      robotId: task.robotId,
      printerId: task.printerId,
      taskType: task.taskType,
      status: task.status,
      priority: task.priority,
      createdAt: task.createdAt,
      parameters: task.parameters || undefined
    });

    return task;
  }

  /**
   * Get task by ID
   */
  static async getTask(taskId: string): Promise<any> {
    return prisma.robotTask.findUnique({
      where: { id: taskId }
    });
  }

  /**
   * Get all tasks for a printer
   */
  static async getPrinterTasks(printerId: string): Promise<any[]> {
    return prisma.robotTask.findMany({
      where: { printerId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }

  /**
   * Update task status
   */
  static async updateTaskStatus(
    taskId: string, 
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED',
    errorMessage?: string
  ): Promise<any> {
    const updateData: any = { 
      status,
      ...(status === 'IN_PROGRESS' ? { startedAt: new Date() } : {}),
      ...(status === 'COMPLETED' || status === 'FAILED' ? { completedAt: new Date() } : {})
    };

    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    return prisma.robotTask.update({
      where: { id: taskId },
      data: updateData
    });
  }

  /**
   * Get robot status
   */
  static async getRobotStatus(robotId: string): Promise<RobotStatus | null> {
    const robot = robotFactory.getRobot(robotId);
    if (!robot) {
      return null;
    }

    return await robot.getStatus();
  }

  /**
   * Get all robots status
   */
  static async getAllRobotsStatus(): Promise<Map<string, RobotStatus>> {
    return await robotFactory.getAllRobotsStatus();
  }

  /**
   * Emergency stop all robots
   */
  static async emergencyStopAll(): Promise<void> {
    await robotFactory.emergencyStopAll();
    
    // Log emergency stop in database
    await prisma.robotEvent.createMany({
      data: Array.from(robotFactory.getAllRobots().keys()).map(robotId => ({
        robotId,
        eventType: 'EMERGENCY_STOP',
        message: 'Emergency stop triggered from application'
      }))
    });
  }

  /**
   * Register a new robot
   */
  static async registerRobot(config: Omit<RobotConfig, 'id'>): Promise<any> {
    const robot = await prisma.robotConfig.create({
      data: config as any
    });

    // Create controller instance
    robotFactory.createRobot(robot as any);

    return robot;
  }

  /**
   * Remove a robot
   */
  static async removeRobot(robotId: string): Promise<void> {
    await robotFactory.disconnectRobot(robotId);
    await prisma.robotConfig.delete({
      where: { id: robotId }
    });
  }

  /**
   * Get robot events/history
   */
  static async getRobotEvents(robotId: string, limit: number = 100): Promise<any[]> {
    return prisma.robotEvent.findMany({
      where: { robotId },
      orderBy: { timestamp: 'desc' },
      take: limit
    });
  }
}
