/**
 * Robot Control System for 3D Print Farm Automation
 * 
 * Supports: ABB, FANUC, Yaskawa Motoman, KUKA
 * Protocol: Modbus TCP (recommended for industrial automation)
 * Alternative: OPC UA, REST API
 * 
 * Architecture:
 * - Unified Robot Interface
 * - Vendor-specific adapters
 * - Task queue management
 * - Safety monitoring
 */

export interface RobotConfig {
  id: string;
  name: string;
  vendor: 'ABB' | 'FANUC' | 'YASKAWA' | 'KUKA';
  model: string;
  ipAddress: string;
  port: number;
  protocol: 'MODBUS_TCP' | 'OPC_UA' | 'REST_API';
  stationId: string;
  isActive: boolean;
  maxPayload?: number;
  reach?: number;
  // SLA/Dental Automation specific
  supportedPrinters?: string[]; // e.g., ['Formlabs Form 4L', 'Formlabs Form 4BL']
  hasCustomGripper?: boolean;
  gripperType?: 'BUILD_PLATFORM' | 'BASKET' | 'UNIVERSAL';
}

export interface RobotTask {
  id: string;
  robotId: string;
  printerId: string;
  taskType: RobotTaskType;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  priority: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  parameters?: Record<string, any>;
  errorMessage?: string;
}

export type RobotTaskType = 
  // Generic FDM tasks
  | 'PART_REMOVAL' 
  | 'BED_PREP' 
  | 'INSPECTION' 
  | 'MATERIAL_LOAD'
  // SLA/Dental specific tasks
  | 'BUILD_PLATFORM_REMOVAL'
  | 'DOOR_OPEN'
  | 'DOOR_CLOSE'
  | 'BASKET_TRANSFER'
  | 'WASH_LOAD'
  | 'WASH_UNLOAD'
  | 'CURE_LOAD'
  | 'CURE_UNLOAD'
  | 'DENTAL_MODEL_INSPECTION'
  | 'PLATFORM_CLEANING'
  | 'RESIN_REFILL';

export interface RobotStatus {
  robotId: string;
  isConnected: boolean;
  isBusy: boolean;
  currentTask?: string;
  position?: { x: number; y: number; z: number; rx: number; ry: number; rz: number };
  batteryLevel?: number;
  errorCodes?: string[];
  lastHeartbeat: Date;
}

export interface RobotCommand {
  command: string;
  parameters?: Record<string, any>;
  timeout?: number;
}

export interface RobotResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
}
