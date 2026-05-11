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
}

export interface RobotTask {
  id: string;
  robotId: string;
  printerId: string;
  taskType: 'PART_REMOVAL' | 'BED_PREP' | 'INSPECTION' | 'MATERIAL_LOAD';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  priority: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  parameters?: Record<string, any>;
  errorMessage?: string;
}

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
