/**
 * Robot Factory - Creates appropriate robot controller based on vendor
 * Manages multiple robots for 3D print farm automation
 */

import { RobotConfig, RobotStatus, RobotTask, RobotResponse } from './types';
import { RobotController } from './RobotController';
import { ABBRobotController } from './ABBRobotController';
import { FANUCRobotController } from './FANUCRobotController';
import { YaskawaRobotController } from './YaskawaRobotController';
import { KUKARobotController } from './KUKARobotController';

export class RobotFactory {
  private static instance: RobotFactory | null = null;
  private robots: Map<string, RobotController> = new Map();
  private taskQueue: RobotTask[] = [];
  private isProcessing: boolean = false;
  private processingLock: boolean = false;
  private maxRetries: number = 3;
  private defaultTimeout: number = 30000; // 30 seconds

  private constructor() {}

  /**
   * Thread-safe singleton instance getter
   */
  static getInstance(): RobotFactory {
    if (!RobotFactory.instance) {
      RobotFactory.instance = new RobotFactory();
    }
    return RobotFactory.instance;
  }

  /**
   * Reset instance (for testing/serverless environments)
   */
  static resetInstance(): void {
    RobotFactory.instance = null;
  }

  /**
   * Create and register a robot controller
   */
  createRobot(config: RobotConfig): RobotController {
    let controller: RobotController;

    switch (config.vendor) {
      case 'ABB':
        controller = new ABBRobotController(config);
        break;
      case 'FANUC':
        controller = new FANUCRobotController(config);
        break;
      case 'YASKAWA':
        controller = new YaskawaRobotController(config);
        break;
      case 'KUKA':
        controller = new KUKARobotController(config);
        break;
      default:
        throw new Error(`Unsupported robot vendor: ${config.vendor}`);
    }

    this.robots.set(config.id, controller);
    console.log(`[RobotFactory] Created ${config.vendor} robot: ${config.name}`);
    
    return controller;
  }

  /**
   * Get robot controller by ID
   */
  getRobot(robotId: string): RobotController | undefined {
    return this.robots.get(robotId);
  }

  /**
   * Get all registered robots
   */
  getAllRobots(): Map<string, RobotController> {
    return this.robots;
  }

  /**
   * Connect to a specific robot
   */
  async connectRobot(robotId: string): Promise<boolean> {
    const robot = this.robots.get(robotId);
    if (!robot) {
      console.error(`[RobotFactory] Robot ${robotId} not found`);
      return false;
    }

    return await robot.connect();
  }

  /**
   * Disconnect from a specific robot
   */
  async disconnectRobot(robotId: string): Promise<void> {
    const robot = this.robots.get(robotId);
    if (robot) {
      await robot.disconnect();
    }
  }

  /**
   * Connect to all registered robots
   */
  async connectAllRobots(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    
    for (const [id, robot] of this.robots) {
      const success = await robot.connect();
      results.set(id, success);
    }

    return results;
  }

  /**
   * Disconnect from all robots
   */
  async disconnectAllRobots(): Promise<void> {
    for (const [, robot] of this.robots) {
      await robot.disconnect();
    }
  }

  /**
   * Add task to queue with priority support
   */
  addTask(task: RobotTask): void {
    // Insert task based on priority (lower number = higher priority)
    const insertIndex = this.taskQueue.findIndex(
      t => (t.priority ?? 5) > (task.priority ?? 5)
    );
    
    if (insertIndex === -1) {
      this.taskQueue.push(task);
    } else {
      this.taskQueue.splice(insertIndex, 0, task);
    }
    
    console.log(`[RobotFactory] Task added to queue: ${task.id} (priority: ${task.priority})`);
    
    if (!this.isProcessing && !this.processingLock) {
      this.processQueue();
    }
  }

  /**
   * Clear all pending tasks from queue (used for emergency stop)
   */
  clearQueue(): void {
    this.taskQueue = [];
    console.log('[RobotFactory] Task queue cleared');
  }

  /**
   * Process task queue with improved concurrency control
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.taskQueue.length === 0 || this.processingLock) {
      return;
    }

    this.processingLock = true;
    this.isProcessing = true;

    try {
      while (this.taskQueue.length > 0) {
        const task = this.taskQueue.shift();
        if (!task) continue;

        try {
          await this.executeTaskWithRetry(task);
        } catch (error) {
          console.error(`[RobotFactory] Task ${task.id} failed after retries:`, error);
          // Update task status to FAILED in database
          await this.updateTaskStatus(task.id, 'FAILED', error instanceof Error ? error.message : 'Unknown error');
        }
      }
    } finally {
      this.isProcessing = false;
      this.processingLock = false;
      
      // Process any new tasks that were added while processing
      if (this.taskQueue.length > 0) {
        setImmediate(() => this.processQueue());
      }
    }
  }

  /**
   * Execute task with retry logic and timeout
   */
  private async executeTaskWithRetry(task: RobotTask): Promise<void> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await this.executeTask(task);
        return; // Success, exit retry loop
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`[RobotFactory] Task ${task.id} attempt ${attempt}/${this.maxRetries} failed:`, lastError.message);
        
        if (attempt < this.maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Update task status in database
   */
  private async updateTaskStatus(
    taskId: string, 
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED',
    errorMessage?: string
  ): Promise<void> {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      await prisma.robotTask.update({
        where: { id: taskId },
        data: { 
          status,
          ...(status === 'IN_PROGRESS' ? { startedAt: new Date() } : {}),
          ...(status === 'COMPLETED' || status === 'FAILED' ? { completedAt: new Date() } : {}),
          ...(errorMessage ? { errorMessage } : {})
        }
      });
      
      await prisma.$disconnect();
    } catch (error) {
      console.error(`[RobotFactory] Failed to update task ${taskId} status:`, error);
    }
  }

  /**
   * Execute a single task
   */
  private async executeTask(task: RobotTask): Promise<void> {
    const robot = this.robots.get(task.robotId);
    if (!robot) {
      console.error(`[RobotFactory] Robot ${task.robotId} not found for task ${task.id}`);
      return;
    }

    console.log(`[RobotFactory] Executing task ${task.id} on robot ${task.robotId}`);

    let response: RobotResponse;

    switch (task.taskType) {
      case 'PART_REMOVAL':
        response = await robot.removePart(task.printerId, task.parameters);
        break;
      case 'BED_PREP':
        response = await robot.prepareBed(task.printerId, task.parameters);
        break;
      case 'INSPECTION':
        response = await robot.inspectPart(task.printerId, task.parameters);
        break;
      case 'MATERIAL_LOAD':
        response = await robot.loadMaterial(task.printerId, task.parameters);
        break;
      default:
        console.error(`[RobotFactory] Unknown task type: ${task.taskType}`);
        return;
    }

    if (response.success) {
      console.log(`[RobotFactory] Task ${task.id} completed successfully`);
    } else {
      console.error(`[RobotFactory] Task ${task.id} failed: ${response.error}`);
    }
  }

  /**
   * Get status of all robots
   */
  async getAllRobotsStatus(): Promise<Map<string, RobotStatus>> {
    const statuses = new Map<string, RobotStatus>();

    for (const [id, robot] of this.robots) {
      const status = await robot.getStatus();
      statuses.set(id, status);
    }

    return statuses;
  }

  /**
   * Emergency stop all robots - clears queue and stops all robots
   */
  async emergencyStopAll(): Promise<void> {
    console.log('[RobotFactory] EMERGENCY STOP - All robots');
    
    // Clear pending tasks from queue
    this.clearQueue();
    
    // Stop all robots
    for (const [, robot] of this.robots) {
      await robot.emergencyStop();
    }
  }

  /**
   * Get queue status
   */
  getQueueStatus(): { pending: number; processing: boolean } {
    return {
      pending: this.taskQueue.length,
      processing: this.isProcessing
    };
  }
}

// Export singleton instance
export const robotFactory = RobotFactory.getInstance();
