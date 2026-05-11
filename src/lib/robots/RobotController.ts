/**
 * Unified Robot Controller Interface
 * Abstract base class for all robot vendors
 */

import { 
  RobotConfig, 
  RobotTask, 
  RobotStatus, 
  RobotCommand, 
  RobotResponse 
} from './types';

export abstract class RobotController {
  protected config: RobotConfig;
  protected connection: any = null;
  protected isConnected: boolean = false;

  constructor(config: RobotConfig) {
    this.config = config;
  }

  /**
   * Establish connection to robot controller
   */
  abstract connect(): Promise<boolean>;

  /**
   * Disconnect from robot controller
   */
  abstract disconnect(): Promise<void>;

  /**
   * Execute a robot command
   */
  abstract executeCommand(command: RobotCommand): Promise<RobotResponse>;

  /**
   * Get current robot status
   */
  abstract getStatus(): Promise<RobotStatus>;

  /**
   * Execute task: Remove printed part from bed
   */
  abstract removePart(printerId: string, parameters?: any): Promise<RobotResponse>;

  /**
   * Execute task: Prepare print bed (cleaning, adhesive application)
   */
  abstract prepareBed(printerId: string, parameters?: any): Promise<RobotResponse>;

  /**
   * Execute task: Visual inspection of printed part
   */
  abstract inspectPart(printerId: string, parameters?: any): Promise<RobotResponse>;

  /**
   * Execute task: Load raw material
   */
  abstract loadMaterial(printerId: string, parameters?: any): Promise<RobotResponse>;

  /**
   * Emergency stop
   */
  abstract emergencyStop(): Promise<void>;

  /**
   * Get robot vendor name
   */
  getVendor(): string {
    return this.config.vendor;
  }

  /**
   * Get robot configuration
   */
  getConfig(): RobotConfig {
    return this.config;
  }

  /**
   * Check if robot is connected
   */
  isConnectionActive(): boolean {
    return this.isConnected;
  }
}
