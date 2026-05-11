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
  private static instance: RobotFactory;
  private robots: Map<string, RobotController> = new Map();
  private taskQueue: RobotTask[] = [];
  private isProcessing: boolean = false;

  private constructor() {}

  static getInstance(): RobotFactory {
    if (!RobotFactory.instance) {
      RobotFactory.instance = new RobotFactory();
    }
    return RobotFactory.instance;
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
   * Add task to queue
   */
  addTask(task: RobotTask): void {
    this.taskQueue.push(task);
    console.log(`[RobotFactory] Task added to queue: ${task.id}`);
    
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Process task queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.taskQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift();
      if (!task) continue;

      try {
        await this.executeTask(task);
      } catch (error) {
        console.error(`[RobotFactory] Task ${task.id} failed:`, error);
      }
    }

    this.isProcessing = false;
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
   * Emergency stop all robots
   */
  async emergencyStopAll(): Promise<void> {
    console.log('[RobotFactory] EMERGENCY STOP - All robots');
    
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
