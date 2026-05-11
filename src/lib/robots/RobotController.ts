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

  // SLA/Dental Automation specific methods
  
  /**
   * Execute task: Remove build platform from SLA printer
   */
  abstract removeBuildPlatform(printerId: string, parameters?: any): Promise<RobotResponse>;

  /**
   * Execute task: Open printer door
   */
  abstract openDoor(printerId: string, parameters?: any): Promise<RobotResponse>;

  /**
   * Execute task: Close printer door
   */
  abstract closeDoor(printerId: string, parameters?: any): Promise<RobotResponse>;

  /**
   * Execute task: Transfer basket between stations
   */
  abstract transferBasket(fromStation: string, toStation: string, parameters?: any): Promise<RobotResponse>;

  /**
   * Execute task: Load basket into wash station
   */
  abstract loadWash(stationId: string, parameters?: any): Promise<RobotResponse>;

  /**
   * Execute task: Unload basket from wash station
   */
  abstract unloadWash(stationId: string, parameters?: any): Promise<RobotResponse>;

  /**
   * Execute task: Load basket into cure station
   */
  abstract loadCure(stationId: string, parameters?: any): Promise<RobotResponse>;

  /**
   * Execute task: Unload basket from cure station
   */
  abstract unloadCure(stationId: string, parameters?: any): Promise<RobotResponse>;

  /**
   * Execute task: Inspect dental models for quality
   */
  abstract inspectDentalModels(printerId: string, parameters?: any): Promise<RobotResponse>;

  /**
   * Execute task: Clean build platform
   */
  abstract cleanPlatform(printerId: string, parameters?: any): Promise<RobotResponse>;

  /**
   * Execute task: Refill resin tank
   */
  abstract refillResin(printerId: string, parameters?: any): Promise<RobotResponse>;

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
