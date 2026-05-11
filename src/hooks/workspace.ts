// Define all types locally
export type Currency = 'USD' | 'EUR' | 'AED' | 'INR';
export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Need Reorder';
export type InventoryCategory = 'Packing Material' | 'Electronics' | 'Tools' | 'Miscellaneous';
export type MaterialStatus = 'New' | 'Active' | 'Low' | 'Critical' | 'Empty' | 'Need Reorder';
export type PrinterStatus = 'Online' | 'Offline' | 'Maintenance' | 'Printing';
// Using the full printer technology definition from use-workspace.tsx
export type PrinterTechnology = 'FDM' | 'SLA' | 'SLS' | 'DLP' | 'MJF' | 'EBM' | 'DMLS';

export interface CodeSettings {
    prefixes: {
      project: string;
      order: string;
      customer: string;
      printer: string;
      spool: string;
      resin: string;
      powder: string;
    }
}

export interface InventoryItem {
    id: string;
    barcode: string;
    name: string;
    description?: string;
    category: InventoryCategory;
    quantity: number;
    minStock: number;
    minOrder: number;
    location?: string;
    status: StockStatus;
    imageUrl?: string;
}

export interface InventoryItemMaster {
    barcode: string;
    name: string;
    description?: string;
    category: InventoryCategory;
    minStock: number;
    minOrder: number;
    location?: string;
    imageUrl?: string;
}

export interface CostCalculationResult {
    costPerUnit: number;
    materialCost: number;
    laborCost: number;
    electricityCost: number;
    failureRateCost: number;
    customCosts: number;
    totalOverhead: number;
    profitAmount: number;
    sellingPrice: number;
    subtotal?: number;
    consumerPrice?: number;
    resellerPrice?: number;
}

export interface CostInputsState {
    jobName: string;
    productImage: string;
    currency: 'USD' | 'EUR' | 'AED' | 'INR';
    printHours: number | string;
    printMinutes: number | string;
    filamentWeight: number | string;
    filamentType: 'pla' | 'abs' | 'petg' | 'tpu' | 'resin';
    spoolPrice: number | string;
    spoolWeight: number | string;
    wastage: number;
    printerPower: number | string;
    electricityCost: number | string;
    laborRate: number | string;
    designTime: number | string;
    setupTime: number | string;
    postProcessingTime: number | string;
    qcTime: number | string;
    printerCost: number | string;
    investmentReturn: number | string;
    dailyUsage: number;
    repairCostPercentage: number;
    packagingItems: Array<{ name: string; quantity: number; unitPrice: number }>;
    extraCosts: Array<{ name: string; baseAmount: number; percentage: number }>;
    materialWeight?: number;
    materialCostPerKg?: number;
    printTime?: number;
    laborCostPerHour?: number;
    powerConsumption?: number;
    electricityRate: number;
    failureRate: number;
    quantity: number;
    overheadPercentage: number;
    customCosts: {
        name: string;
        cost: number;
    }[];
}

export interface PricingInputs {
    consumer: {
        tax: number;
        creditCardFee: number;
        adsCost: number;
        targetProfit: number;
    };
    reseller: {
        tax: number;
        creditCardFee: number;
        targetProfit: number;
    };
    profitMargin?: number;
    profitType?: 'percentage' | 'fixed';
    includeTaxes?: boolean;
    taxRate?: number;
}

export interface Customer {
    id: string;
    customerCode: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    address?: string;
    notes?: string;
    createdAt?: Date | string;
    orders?: number;
    totalValue?: number;
    taxId?: string;
}

export type DocumentType = 'Invoice' | 'Quote' | 'Delivery Note' | 'Receipt' | 'Quotation' | 'Purchase Order' | 'Tax Invoice';

export interface Document {
    id: string;
    docType: DocumentType;
    orderId: string;
    orderName?: string;
    orderNumber: string;
    customerName?: string;
    customerId?: string;
    amount: number;
    currency: string;
    status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
    createdAt: string;
    date: string;
    dueDate?: string;
}

export interface Spool {
    id: number;
    spoolId: string;
    name: string;
    brand: string;
    color: string;
    material: string;
    finish: string;
    weight: number;
    used: number;
    price: number;
    currency: Currency;
    purchaseDate: string;
    notes?: string;
    status: MaterialStatus;
    assignedToPrinterId?: string;
    assignedToJobId?: string | number;
    imageUrl?: string;
    minStock: number;
    minOrder: number;
    location?: string;
}

export interface Resin {
    id: number;
    resinId: string;
    name: string;
    brand: string;
    color: string;
    type: string;
    volume: number;
    used: number;
    price: number;
    currency: Currency;
    purchaseDate: string;
    notes?: string;
    status: MaterialStatus;
    assignedToPrinterId?: string;
    assignedToJobId?: string | number;
    imageUrl?: string;
    minStock: number;
    minOrder: number;
    location?: string;
}

export interface Powder {
    id: number;
    powderId: string;
    name: string;
    brand: string;
    material: string;
    color?: string;
    weight: number;
    used: number;
    price: number;
    currency: Currency;
    purchaseDate: string;
    notes?: string;
    status: MaterialStatus;
    assignedToPrinterId?: string;
    assignedToJobId?: string | number;
    imageUrl?: string;
    minStock: number;
    minOrder: number;
    location?: string;
}

export interface Printer {
    id: string;
    name: string;
    model: string;
    codeName?: string; // Added codeName property
    status: PrinterStatus;
    technology: PrinterTechnology;
    initializationDate?: Date; // Added for when the printer was set up
    capacity?: string; // Added for printer capacity (Small, Standard, Large, Production)
    material?: string; // Added for the material the printer uses
    buildVolume?: string; // Made optional as it's missing in the data
    layerHeight?: string; // Made optional as it's missing in the data
    nozzleDiameter?: string;
    notes?: string;
    imageUrl?: string;
    location?: string;
    maintenanceStatus?: {
        lastMaintenance: string;
        nextMaintenance: string;
        status: 'OK' | 'Due Soon' | 'Overdue' | 'In Maintenance';
    };
    consumables?: {
        name: string;
        status: 'OK' | 'Low' | 'Empty';
    }[];
    currentJob?: {
        jobId: string;
        name: string;
        progress: number;
        timeRemaining: string;
    };
}

export interface LoggedCalculation {
    id: string;
    name: string;
    jobId?: string;
    orderId?: string;
    inputs: CostInputsState;
    pricingInputs: PricingInputs;
    result: CostCalculationResult;
    createdAt?: string;
}

export interface SavedCalculation {
    id: string;
    name: string;
    inputs: CostInputsState;
    pricingInputs: PricingInputs;
    createdAt?: string;
};

// Define Job and ItemGroup types since they are missing
export interface Job {
    id: number | string;
    name: string;
    projectCode: string;
    priority: 'Low' | 'Medium' | 'High';
    deadline: string;
    requiredTechnology: string;
    imageUrl?: string;
    items: number;
    estimatedTime?: number;
    estHoursPerItem?: number;
    estMinutesPerItem?: number;
    notes?: string;
    isEmergency?: boolean;
    isConfirmed?: boolean;
    itemGroups?: ItemGroup[];
}

export interface ScheduledJob {
    id: number | string;
    name: string;
    projectCode: string;
    priority: 'Low' | 'Medium' | 'High';
    deadline: string;
    requiredTechnology: string;
    imageUrl?: string;
    items: number;
    estimatedTime?: number;
    estHoursPerItem?: number;
    estMinutesPerItem?: number;
    notes?: string;
    isEmergency?: boolean;
    isConfirmed?: boolean;
    itemGroups?: ItemGroup[];
    start: string;
    end: string;
    printerId: string;
}

export interface ItemGroup {
    id: string;
    name?: string;
    quantity: number;
    materials?: {
        id: string;
        name: string;
        material: string;
        color: string;
        finish: string;
        useCustom: boolean;
    }[];
}

// The types are already exported directly, no need to re-export them

// Define Order interface
export interface Order {
  id: string;
  customer: string | Customer;
  orderNumber: string;
  projectCode?: string;
  orderDate?: string;
  date?: string;
  deadline?: string;
  dueDate?: string;
  status: string;
  paymentStatus?: string;
  items: any[] | number;
  priority?: "low" | "medium" | "high";
  notes?: string;
  printerTech?: string;
  salesPerson?: string;
  imageUrl?: string;
  total?: number;
  trackingInfo?: {
    carrier: string;
    trackingNumber: string;
    shippedDate: string;
    estimatedDelivery: string;
  };
}

// Define MaterialTypeDefinition
export type MaterialTypeDefinition = {
    barcode: string;
    type: 'spool' | 'resin' | 'powder';
    name: string;
    brand: string;
    material: string; // For spool/powder
    color?: string; // For spool/resin
    finish?: string; // For spool
    weight?: number; // For spool/powder
    volume?: number; // For resin
    price: number;
    currency: 'USD' | 'GBP' | 'EUR' | 'AED' | 'INR';
    minStock: number;
    minOrder: number;
    imageUrl?: string;
};

export interface CodeSettings {
    project: string;
    customer: string;
    printer: string;
    spool: string;
    resin: string;
    powder: string;
    inventoryItem: string;
    quotation: string;
    purchaseOrder: string;
    taxInvoice: string;
};

// PrinterTechnology is already defined above

// Re-export from workspace-context
export { useWorkspace, WorkspaceContext, WorkspaceProvider } from './workspace-context';