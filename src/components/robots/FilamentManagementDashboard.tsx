'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Edit,
  Spool,
  Warehouse,
  Settings,
  TrendingUp,
  Clock,
  Thermometer,
  Droplets
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Types for Filament Management
interface FilamentSpool {
  id: string;
  material: string;
  color: string;
  brand: string;
  diameter: number;
  weight: number; // in grams
  remainingWeight: number;
  location: string;
  status: 'available' | 'in_use' | 'low' | 'empty' | 'reserved';
  installedDate?: Date;
  expiryDate?: Date;
  moistureLevel?: number; // percentage
  temperature?: number; // in Celsius
}

interface DryerUnit {
  id: string;
  name: string;
  status: 'idle' | 'drying' | 'cooling' | 'error';
  currentSpoolId?: string;
  targetTemperature: number;
  currentTemperature: number;
  humidity: number;
  timeRemaining?: number; // in minutes
  lastMaintenance?: Date;
}

interface StorageSlot {
  id: string;
  slotNumber: number;
  spoolId?: string;
  isClimateControlled: boolean;
  temperature: number;
  humidity: number;
}

interface MaterialChangeRequest {
  id: string;
  printerId: string;
  printerName: string;
  currentMaterial: string;
  requestedMaterial: string;
  color: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdAt: Date;
  estimatedTime?: number; // in minutes
}

interface FilamentStats {
  totalSpools: number;
  availableSpools: number;
  lowSpools: number;
  emptySpools: number;
  totalWeight: number;
  remainingWeight: number;
  activeDryers: number;
  pendingChanges: number;
}

// Mock Data
const initialSpools: FilamentSpool[] = [
  {
    id: '1',
    material: 'PLA',
    color: 'White',
    brand: 'Prusament',
    diameter: 1.75,
    weight: 1000,
    remainingWeight: 850,
    location: 'A-01',
    status: 'available',
    moistureLevel: 2.1,
    temperature: 22
  },
  {
    id: '2',
    material: 'PETG',
    color: 'Black',
    brand: 'Hatchbox',
    diameter: 1.75,
    weight: 1000,
    remainingWeight: 320,
    location: 'B-03',
    status: 'low',
    moistureLevel: 3.5,
    temperature: 23
  },
  {
    id: '3',
    material: 'ABS',
    color: 'Gray',
    brand: 'Polymaker',
    diameter: 1.75,
    weight: 1000,
    remainingWeight: 0,
    location: 'C-02',
    status: 'empty',
    moistureLevel: 4.2,
    temperature: 24
  },
  {
    id: '4',
    material: 'TPU',
    color: 'Clear',
    brand: 'NinjaTek',
    diameter: 1.75,
    weight: 500,
    remainingWeight: 480,
    location: 'D-01',
    status: 'in_use',
    installedDate: new Date(),
    moistureLevel: 1.8,
    temperature: 22
  },
  {
    id: '5',
    material: 'PLA',
    color: 'Red',
    brand: 'Prusament',
    diameter: 1.75,
    weight: 1000,
    remainingWeight: 920,
    location: 'A-02',
    status: 'reserved',
    moistureLevel: 2.0,
    temperature: 22
  }
];

const initialDryers: DryerUnit[] = [
  {
    id: '1',
    name: 'Dryer Unit 1',
    status: 'drying',
    currentSpoolId: '2',
    targetTemperature: 55,
    currentTemperature: 54,
    humidity: 8,
    timeRemaining: 45,
    lastMaintenance: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    name: 'Dryer Unit 2',
    status: 'idle',
    targetTemperature: 45,
    currentTemperature: 22,
    humidity: 45,
    lastMaintenance: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    name: 'Dryer Unit 3',
    status: 'cooling',
    currentSpoolId: '5',
    targetTemperature: 50,
    currentTemperature: 35,
    humidity: 12,
    timeRemaining: 15,
    lastMaintenance: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  }
];

const initialStorageSlots: StorageSlot[] = Array.from({ length: 20 }, (_, i) => ({
  id: `${i + 1}`,
  slotNumber: i + 1,
  spoolId: i < 5 ? `${i + 1}` : undefined,
  isClimateControlled: true,
  temperature: 22 + Math.random() * 2,
  humidity: 30 + Math.random() * 10
}));

const initialChangeRequests: MaterialChangeRequest[] = [
  {
    id: '1',
    printerId: 'printer-1',
    printerName: 'Printer #1 - SLA Dental',
    currentMaterial: 'PETG',
    requestedMaterial: 'PLA',
    color: 'White',
    priority: 'high',
    status: 'pending',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    estimatedTime: 15
  },
  {
    id: '2',
    printerId: 'printer-3',
    printerName: 'Printer #3 - Prototyping',
    currentMaterial: 'PLA',
    requestedMaterial: 'TPU',
    color: 'Clear',
    priority: 'medium',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
    estimatedTime: 20
  }
];

export default function FilamentManagementDashboard() {
  const [spools, setSpools] = useState<FilamentSpool[]>(initialSpools);
  const [dryers, setDryers] = useState<DryerUnit[]>(initialDryers);
  const [storageSlots, setStorageSlots] = useState<StorageSlot[]>(initialStorageSlots);
  const [changeRequests, setChangeRequests] = useState<MaterialChangeRequest[]>(initialChangeRequests);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddSpoolOpen, setIsAddSpoolOpen] = useState(false);
  const [selectedSpool, setSelectedSpool] = useState<FilamentSpool | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Calculate statistics
  const stats: FilamentStats = {
    totalSpools: spools.length,
    availableSpools: spools.filter(s => s.status === 'available').length,
    lowSpools: spools.filter(s => s.status === 'low').length,
    emptySpools: spools.filter(s => s.status === 'empty').length,
    totalWeight: spools.reduce((sum, s) => sum + s.weight, 0),
    remainingWeight: spools.reduce((sum, s) => sum + s.remainingWeight, 0),
    activeDryers: dryers.filter(d => d.status === 'drying').length,
    pendingChanges: changeRequests.filter(r => r.status === 'pending').length
  };

  // Handle spool operations
  const handleAddSpool = (newSpool: Omit<FilamentSpool, 'id'>) => {
    const spool: FilamentSpool = {
      ...newSpool,
      id: `${Date.now()}`
    };
    setSpools([...spools, spool]);
    setIsAddSpoolOpen(false);
  };

  const handleRemoveSpool = (spoolId: string) => {
    setSpools(spools.filter(s => s.id !== spoolId));
    setSelectedSpool(null);
  };

  const handleUpdateSpoolStatus = (spoolId: string, status: FilamentSpool['status']) => {
    setSpools(spools.map(s => s.id === spoolId ? { ...s, status } : s));
  };

  // Handle dryer operations
  const handleStartDrying = (dryerId: string, spoolId: string, temperature: number) => {
    setDryers(dryers.map(d => 
      d.id === dryerId 
        ? { 
            ...d, 
            status: 'drying', 
            currentSpoolId: spoolId, 
            targetTemperature: temperature,
            timeRemaining: 120 
          }
        : d
    ));
    setSpools(spools.map(s => 
      s.id === spoolId ? { ...s, status: 'reserved' } : s
    ));
  };

  const handleStopDrying = (dryerId: string) => {
    setDryers(dryers.map(d => 
      d.id === dryerId 
        ? { 
            ...d, 
            status: 'idle', 
            currentSpoolId: undefined, 
            timeRemaining: undefined 
          }
        : d
    ));
  };

  // Handle change requests
  const handleApproveChange = (requestId: string) => {
    setChangeRequests(changeRequests.map(r => 
      r.id === requestId ? { ...r, status: 'in_progress' } : r
    ));
  };

  const handleCompleteChange = (requestId: string) => {
    setChangeRequests(changeRequests.map(r => 
      r.id === requestId ? { ...r, status: 'completed' } : r
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'in_use': return 'bg-blue-500';
      case 'low': return 'bg-yellow-500';
      case 'empty': return 'bg-red-500';
      case 'reserved': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getDryerStatusColor = (status: string) => {
    switch (status) {
      case 'drying': return 'text-orange-500';
      case 'cooling': return 'text-blue-500';
      case 'error': return 'text-red-500';
      case 'idle': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="w-full p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Filament Management System</h1>
          <p className="text-muted-foreground">Automated filament tracking, drying, and material changes for lights-out 3D printing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setRefreshCounter(prev => prev + 1)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsAddSpoolOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Spool
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {stats.lowSpools > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {stats.lowSpools} spool(s) are running low on material and need replacement soon.
          </AlertDescription>
        </Alert>
      )}

      {stats.pendingChanges > 0 && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            {stats.pendingChanges} material change request(s) pending approval.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spools</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSpools}</div>
            <p className="text-xs text-muted-foreground">
              {stats.availableSpools} available, {stats.emptySpools} empty
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Material Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((stats.remainingWeight / stats.totalWeight) * 100)}%</div>
            <Progress value={(stats.remainingWeight / stats.totalWeight) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground">
              {stats.remainingWeight.toLocaleString()}g / {stats.totalWeight.toLocaleString()}g remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Dryers</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeDryers}/{dryers.length}</div>
            <p className="text-xs text-muted-foreground">
              {dryers.filter(d => d.status === 'cooling').length} cooling
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Change Requests</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{changeRequests.filter(r => r.status === 'in_progress').length}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingChanges} pending, {changeRequests.filter(r => r.status === 'completed').length} completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="spools">Spool Inventory</TabsTrigger>
          <TabsTrigger value="dryers">Drying System</TabsTrigger>
          <TabsTrigger value="requests">Material Changes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common filament management tasks</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-auto py-4" onClick={() => setActiveTab('spools')}>
                  <Package className="w-6 h-6 mb-2" />
                  <span>Add New Spool</span>
                </Button>
                <Button variant="outline" className="h-auto py-4" onClick={() => setActiveTab('dryers')}>
                  <Thermometer className="w-6 h-6 mb-2" />
                  <span>Start Drying</span>
                </Button>
                <Button variant="outline" className="h-auto py-4" onClick={() => setActiveTab('requests')}>
                  <RefreshCw className="w-6 h-6 mb-2" />
                  <span>Process Changes</span>
                </Button>
                <Button variant="outline" className="h-auto py-4">
                  <Settings className="w-6 h-6 mb-2" />
                  <span>Configure Alerts</span>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Current storage conditions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span>Average Humidity</span>
                  </div>
                  <Badge variant="secondary">35-40%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-orange-500" />
                    <span>Average Temperature</span>
                  </div>
                  <Badge variant="secondary">22-24°C</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Warehouse className="w-4 h-4 text-green-500" />
                    <span>Storage Capacity</span>
                  </div>
                  <Badge variant="secondary">{spools.length}/{storageSlots.length} slots used</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest filament management events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {changeRequests.slice(0, 5).map(request => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(request.priority)}`} />
                      <div>
                        <p className="font-medium">{request.printerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.currentMaterial} → {request.requestedMaterial} ({request.color})
                        </p>
                      </div>
                    </div>
                    <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
                      {request.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spools Tab */}
        <TabsContent value="spools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {spools.map(spool => (
              <Card key={spool.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedSpool(spool)}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{spool.material}</CardTitle>
                      <CardDescription>{spool.color} - {spool.brand}</CardDescription>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(spool.status)}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Remaining:</span>
                      <span className="font-medium">{spool.remainingWeight}g / {spool.weight}g</span>
                    </div>
                    <Progress value={(spool.remainingWeight / spool.weight) * 100} />
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Droplets className="w-3 h-3" />
                        <span>{spool.moistureLevel}% humidity</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Thermometer className="w-3 h-3" />
                        <span>{spool.temperature}°C</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <Badge variant="outline">{spool.location}</Badge>
                      <Badge variant={spool.status === 'available' ? 'default' : 'secondary'}>
                        {spool.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Dryers Tab */}
        <TabsContent value="dryers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dryers.map(dryer => (
              <Card key={dryer.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{dryer.name}</CardTitle>
                    <span className={`text-sm font-medium ${getDryerStatusColor(dryer.status)}`}>
                      {dryer.status.toUpperCase()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dryer.currentSpoolId && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Current Spool</p>
                      <p className="text-xs text-muted-foreground">
                        {spools.find(s => s.id === dryer.currentSpoolId)?.material} - {spools.find(s => s.id === dryer.currentSpoolId)?.color}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Target Temp:</span>
                      <span>{dryer.targetTemperature}°C</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Current Temp:</span>
                      <span>{dryer.currentTemperature}°C</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Humidity:</span>
                      <span>{dryer.humidity}%</span>
                    </div>
                    {dryer.timeRemaining && (
                      <div className="flex justify-between text-sm">
                        <span>Time Remaining:</span>
                        <span>{dryer.timeRemaining} min</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {dryer.status === 'idle' ? (
                      <Button className="flex-1" size="sm" onClick={() => handleStartDrying(dryer.id, spools[0].id, dryer.targetTemperature)}>
                        Start Drying
                      </Button>
                    ) : (
                      <Button 
                        className="flex-1" 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleStopDrying(dryer.id)}
                      >
                        Stop
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Change Requests</CardTitle>
              <CardDescription>Approve or manage material change requests from printers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {changeRequests.map(request => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{request.printerName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Requested {new Date(request.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(request.priority)}`} />
                        <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Current Material</p>
                        <p className="font-medium">{request.currentMaterial}</p>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Requested Material</p>
                        <p className="font-medium">{request.requestedMaterial} ({request.color})</p>
                      </div>
                    </div>

                    {request.estimatedTime && (
                      <p className="text-sm text-muted-foreground mb-3">
                        Estimated completion time: {request.estimatedTime} minutes
                      </p>
                    )}

                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleApproveChange(request.id)}
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Defer
                        </Button>
                      </div>
                    )}

                    {request.status === 'in_progress' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleCompleteChange(request.id)}
                        className="w-full"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Complete
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Spool Dialog */}
      <Dialog open={isAddSpoolOpen} onOpenChange={setIsAddSpoolOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Filament Spool</DialogTitle>
            <DialogDescription>Enter details for the new filament spool to add to inventory.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleAddSpool({
              material: formData.get('material') as string,
              color: formData.get('color') as string,
              brand: formData.get('brand') as string,
              diameter: parseFloat(formData.get('diameter') as string),
              weight: parseInt(formData.get('weight') as string),
              remainingWeight: parseInt(formData.get('weight') as string),
              location: formData.get('location') as string,
              status: 'available',
              moistureLevel: parseFloat(formData.get('moistureLevel') as string),
              temperature: parseFloat(formData.get('temperature') as string)
            });
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="material">Material Type</Label>
                  <Select name="material" defaultValue="PLA">
                    <SelectTrigger>
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLA">PLA</SelectItem>
                      <SelectItem value="PETG">PETG</SelectItem>
                      <SelectItem value="ABS">ABS</SelectItem>
                      <SelectItem value="TPU">TPU</SelectItem>
                      <SelectItem value="Nylon">Nylon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input name="color" defaultValue="White" required />
                </div>
              </div>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input name="brand" defaultValue="Prusament" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="diameter">Diameter (mm)</Label>
                  <Input name="diameter" type="number" step="0.01" defaultValue="1.75" required />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (g)</Label>
                  <Input name="weight" type="number" defaultValue="1000" required />
                </div>
              </div>
              <div>
                <Label htmlFor="location">Storage Location</Label>
                <Input name="location" placeholder="e.g., A-01" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="moistureLevel">Moisture Level (%)</Label>
                  <Input name="moistureLevel" type="number" step="0.1" defaultValue="2.0" required />
                </div>
                <div>
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input name="temperature" type="number" step="0.1" defaultValue="22" required />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddSpoolOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Spool</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Spool Detail Dialog */}
      {selectedSpool && (
        <Dialog open={!!selectedSpool} onOpenChange={() => setSelectedSpool(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Spool Details</DialogTitle>
              <DialogDescription>{selectedSpool.material} - {selectedSpool.color}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Brand</p>
                  <p className="font-medium">{selectedSpool.brand}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedSpool.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Diameter</p>
                  <p className="font-medium">{selectedSpool.diameter}mm</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge>{selectedSpool.status}</Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Remaining Material</p>
                <Progress value={(selectedSpool.remainingWeight / selectedSpool.weight) * 100} />
                <p className="text-sm mt-1">{selectedSpool.remainingWeight}g / {selectedSpool.weight}g</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Moisture Level</p>
                  <p className="font-medium">{selectedSpool.moistureLevel}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Temperature</p>
                  <p className="font-medium">{selectedSpool.temperature}°C</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="destructive" onClick={() => handleRemoveSpool(selectedSpool.id)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Spool
              </Button>
              <Button variant="outline" onClick={() => setSelectedSpool(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
