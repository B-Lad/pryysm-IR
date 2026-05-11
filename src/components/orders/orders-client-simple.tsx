"use client"

import React from "react"

// Export the Order interface to match what orders-list.tsx expects
export interface Order {
  id: string;
  customer: string | { name: string };
  orderNumber: string;
  projectCode: string;
  orderDate: string;
  deadline: string;
  status: "pending" | "in-progress" | "overdue" | "qc" | "packing" | "dispatched" | "completed";
  items: number;
  priority?: "low" | "medium" | "high";
  notes?: string;
  printerTech: string;
  salesPerson: string;
  imageUrl?: string;
}

// Simple version of the OrdersClient component
const OrdersClient = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Orders</h2>
      <p>Orders content will appear here once the component is fixed.</p>
    </div>
  );
};

export default OrdersClient;