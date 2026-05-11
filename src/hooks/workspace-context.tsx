"use client";

import React, { createContext } from 'react';

// Create a simple WorkspaceContext
export const WorkspaceContext = createContext<any | null>(null);

// Create a simple WorkspaceProvider component to fix the import issues
export const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
  return <WorkspaceContext.Provider value={{}}>{children}</WorkspaceContext.Provider>;
};

// Define the plan type
export type Plan = 'Free' | 'Basic' | 'Pro' | 'Enterprise';

// Define a type for the return value of useWorkspace
type WorkspaceContextValue = {
  currentPlan: Plan;
  orders: any[];
  customers: any[];
  inventory: any[];
  addOrder: (order: any) => void;
  updateOrder: (order: any) => void;
  deleteOrder: (orderId: string) => void;
  [key: string]: any;  // Allow other properties
};

// Export a basic hook that doesn't throw errors when outside a provider
export const useWorkspace = (): WorkspaceContextValue => {
  // For SSR and static generation, don't throw an error
  // Just return default values
  return {
    currentPlan: 'Free' as Plan,
    // Add other common properties that might be needed
    orders: [],
    customers: [],
    inventory: [],
    addOrder: () => {},
    updateOrder: () => {},
    deleteOrder: () => {},
    // Add more mock implementations as needed
  };
};