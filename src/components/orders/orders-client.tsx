"use client"

import React, { useState, useMemo, Suspense, lazy } from "react"
import { OrdersHeader } from "./orders-header"
import { NewOrderForm } from "./new-order-form"
import { useToast } from "../../hooks/use-toast"
import { useWorkspace } from "../../hooks/workspace"
import { Button } from "../ui/button"
import { BarChart, List, PlusCircle, LayoutDashboard } from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs"
import type { Customer } from "../../hooks/workspace"

// Lazy load the orders list to improve initial page load
const OrdersList = lazy(() => import("./orders-list").then(mod => ({ default: mod.OrdersList })));

export interface Order {
  id: string;
  customer: string;
  orderNumber: string;
  projectCode: string;
  orderDate: string;
  deadline: string;
  status: "pending" | "in-progress" | "overdue" | "qc" | "packing" | "dispatched" | "completed";
  items: number;
  priority: "low" | "medium" | "high";
  notes?: string;
  printerTech: string;
  salesPerson: string;
  imageUrl?: string;
}

export function OrdersClient() {
  const { toast } = useToast();
  const { orders, customers, addOrder, updateOrder, deleteOrder } = useWorkspace() as any;
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [activeView, setActiveView] = useState<"list" | "kanban" | "analytics">("list");
  
  const handleAddOrder = (orderData: any) => {
    try {
      addOrder(orderData);
      setShowNewOrderForm(false);
      toast({
        title: "Order added successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Failed to add order",
        description: "An error occurred while adding the order",
        variant: "destructive",
      });
    }
  };

  const getViewContent = () => {
    switch (activeView) {
      case "list":
        return (
          <Suspense fallback={<div>Loading orders...</div>}>
            <OrdersList orders={orders} updateOrder={updateOrder} deleteOrder={deleteOrder} />
          </Suspense>
        );
      case "kanban":
        return <div className="p-8 text-center">Kanban view coming soon</div>;
      case "analytics":
        return <div className="p-8 text-center">Analytics view coming soon</div>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <OrdersHeader onNewOrderClick={() => setShowNewOrderForm(true)} />
        <Button onClick={() => setShowNewOrderForm(true)} className="ml-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> New Order
        </Button>
      </div>

      <Tabs defaultValue="list" className="flex-1 flex flex-col">
        <TabsList className="mb-6">
          <TabsTrigger value="list" onClick={() => setActiveView("list")}>
            <List className="mr-2 h-4 w-4" /> List View
          </TabsTrigger>
          <TabsTrigger value="kanban" onClick={() => setActiveView("kanban")}>
            <LayoutDashboard className="mr-2 h-4 w-4" /> Kanban
          </TabsTrigger>
          <TabsTrigger value="analytics" onClick={() => setActiveView("analytics")}>
            <BarChart className="mr-2 h-4 w-4" /> Analytics
          </TabsTrigger>
        </TabsList>

        <div className="flex-1">
          {getViewContent()}
        </div>
      </Tabs>

      {showNewOrderForm && (
        <NewOrderForm 
          customers={customers} 
          onSubmit={handleAddOrder}
          onCancel={() => setShowNewOrderForm(false)}
        />
      )}
    </div>
  );
}

export default OrdersClient;
