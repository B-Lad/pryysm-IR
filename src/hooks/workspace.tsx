'use client';

// Re-export WorkspaceProvider and useWorkspace from use-workspace.tsx
// This ensures backward compatibility with components that import from workspace.tsx
export * from './use-workspace';

// Explicitly export WorkspaceProvider to ensure it's available for import
import { WorkspaceProvider as WSP } from './use-workspace';
export const WorkspaceProvider = WSP;

// Export all types from this file to maintain compatibility
export type {
  Currency,
  StockStatus,
  InventoryCategory,
  InventoryItem,
  InventoryItemMaster,
  MaterialStatus,
  Spool,
  Resin,
  Powder
} from './use-workspace';