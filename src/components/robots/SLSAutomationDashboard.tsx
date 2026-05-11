'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Thermometer, 
  RefreshCw, 
  Settings, 
  AlertTriangle,
  Activity,
  Layers,
  Wind,
  Eye,
  Scan,
  Wrench,
  Play,
  Pause,
  StopCircle
} from 'lucide-react';
import type { Printer } from '@/hooks/workspace';

interface SLSAutomationDashboardProps {
  printer?: Printer;
}

export function SLSAutomationDashboard({ printer }: SLSAutomationDashboardProps) {
  const [selectedChamber, setSelectedChamber] = useState<string>('');
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!printer || printer.technology !== 'SLS') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>SLS Automation Dashboard requires an SLS printer</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chambers = printer.buildChambers || [];
  const activeChamber = chambers.find(c => c.id === printer.activeChamberId);
  const automationStatus = printer.automationStatus;
  const toolSystem = printer.toolChangeSystem;

  const getCycleStateColor = (state: string) => {
    switch (state) {
      case 'Printing': return 'bg-blue-500';
      case 'Cooling': return 'bg-orange-500';
      case 'Swapping Chamber': return 'bg-purple-500';
      case 'Cleaning Powder': return 'bg-yellow-500';
      case 'Cleaning Optics': return 'bg-cyan-500';
      case 'Error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getChamberStatusColor = (status: string) => {
    switch (status) {
      case 'Installed': return 'bg-green-500';
      case 'Cooling': return 'bg-orange-500';
      case 'Ready': return 'bg-blue-500';
      case 'In Post-Processing': return 'bg-purple-500';
      case 'Cleaning': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getTemperatureColor = (current: number, target: number) => {
    if (current <= target + 5) return 'text-green-600';
    if (current <= target + 20) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{printer.name}</h2>
          <p className="text-muted-foreground">{printer.model} • {printer.codeName}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isAutoMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsAutoMode(!isAutoMode)}
          >
            {isAutoMode ? <CheckCircle className="h-4 w-4 mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
            Auto Mode
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Automation Status Banner */}
      {automationStatus && (
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className={`h-6 w-6 ${getCycleStateColor(automationStatus.cycleState).replace('bg-', 'text-')}`} />
                <div>
                  <p className="font-semibold">Current State: {automationStatus.cycleState}</p>
                  <p className="text-sm text-muted-foreground">
                    Next: {automationStatus.nextAction} • {automationStatus.estimatedNextActionTime && new Date(automationStatus.estimatedNextActionTime).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <Badge variant="secondary">
                {automationStatus.consecutivePrintsCompleted} consecutive prints
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="chambers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chambers">
            <Layers className="h-4 w-4 mr-2" />
            Build Chambers
          </TabsTrigger>
          <TabsTrigger value="tools">
            <Wrench className="h-4 w-4 mr-2" />
            Tool System
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <Settings className="h-4 w-4 mr-2" />
            Maintenance
          </TabsTrigger>
        </TabsList>

        {/* Build Chambers Tab */}
        <TabsContent value="chambers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {chambers.map((chamber) => (
              <Card 
                key={chamber.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${selectedChamber === chamber.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedChamber(chamber.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{chamber.id}</CardTitle>
                      <CardDescription>
                        <Badge className={`${getChamberStatusColor(chamber.status)} text-white`}>
                          {chamber.status}
                        </Badge>
                      </CardDescription>
                    </div>
                    {chamber.id === printer.activeChamberId && (
                      <Badge variant="default">Active</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Temperature */}
                  {chamber.temperature !== undefined && (
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-muted-foreground" />
                      <span className={`font-medium ${getTemperatureColor(chamber.temperature, chamber.targetTemperature || 0)}`}>
                        {chamber.temperature}°C
                      </span>
                      <span className="text-xs text-muted-foreground">
                        → {chamber.targetTemperature}°C
                      </span>
                    </div>
                  )}

                  {/* Parts Count */}
                  {chamber.partsCount !== undefined && (
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      <span>{chamber.partsCount} parts</span>
                    </div>
                  )}

                  {/* Powder Level */}
                  {chamber.powderLevel !== undefined && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Wind className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Powder: {chamber.powderLevel}%</span>
                      </div>
                      <Progress value={chamber.powderLevel} className="h-2" />
                    </div>
                  )}

                  {/* Cooldown Info */}
                  {chamber.cooldownStartTime && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Cooling since: {new Date(chamber.cooldownStartTime).toLocaleTimeString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Chamber Actions */}
          {selectedChamber && (
            <Card>
              <CardHeader>
                <CardTitle>Chamber Actions: {selectedChamber}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {printer.chamberSwapEnabled && (
                    <>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Swap Chamber
                      </Button>
                      <Button variant="outline" size="sm">
                        <Thermometer className="h-4 w-4 mr-2" />
                        Monitor Temp
                      </Button>
                    </>
                  )}
                  {printer.powderCleanupEnabled && (
                    <Button variant="outline" size="sm">
                      <Wind className="h-4 w-4 mr-2" />
                      Clean Powder
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tool System Tab */}
        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tool Change System</CardTitle>
              <CardDescription>
                Current Tool: <Badge>{toolSystem?.currentTool || 'None'}</Badge>
                {toolSystem?.toolChangeTime && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    Change time: {toolSystem.toolChangeTime}s
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {toolSystem?.availableTools.map((tool) => (
                  <Card key={tool} className={tool === toolSystem.currentTool ? 'border-blue-500 bg-blue-50' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {tool.includes('Gripper') && <Scan className="h-8 w-8 text-blue-500" />}
                        {tool.includes('Fork') && <Layers className="h-8 w-8 text-green-500" />}
                        {tool.includes('Vacuum') && <Wind className="h-8 w-8 text-yellow-500" />}
                        {tool.includes('Optical') && <Eye className="h-8 w-8 text-cyan-500" />}
                        {tool.includes('IR') && <Thermometer className="h-8 w-8 text-red-500" />}
                        <div>
                          <p className="font-medium">{tool}</p>
                          {tool === toolSystem.currentTool && (
                            <Badge variant="default" className="mt-1">Active</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Automation Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle>Automation Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  {printer.chamberSwapEnabled ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-gray-400" />}
                  <span>Automated Chamber Swap</span>
                </div>
                <div className="flex items-center gap-2">
                  {printer.powderCleanupEnabled ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-gray-400" />}
                  <span>Automated Powder Cleanup</span>
                </div>
                <div className="flex items-center gap-2">
                  {printer.opticalCleaningEnabled ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-gray-400" />}
                  <span>Optical Cassette Cleaning</span>
                </div>
                <div className="flex items-center gap-2">
                  {printer.irSensorCleaningEnabled ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-gray-400" />}
                  <span>IR Sensor Cleaning</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Status</CardTitle>
              {printer.maintenanceStatus && (
                <CardDescription>
                  Last: {new Date(printer.maintenanceStatus.lastMaintenance).toLocaleDateString()} • 
                  Next: {new Date(printer.maintenanceStatus.nextMaintenance).toLocaleDateString()} • 
                  Status: <Badge>{printer.maintenanceStatus.status}</Badge>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationStatus?.lastMaintenanceCycle && (
                  <div className="flex justify-between items-center">
                    <span>Last Automation Cycle</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(automationStatus.lastMaintenanceCycle).toLocaleString()}
                    </span>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Quick Actions</h4>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Clean Optics Now
                    </Button>
                    <Button variant="outline" size="sm">
                      <Thermometer className="h-4 w-4 mr-2" />
                      Check Sensors
                    </Button>
                    <Button variant="outline" size="sm">
                      <Wind className="h-4 w-4 mr-2" />
                      Full Powder Cleanup
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Schedule Maintenance
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Controls */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700">
                <AlertTriangle className="h-5 w-5 inline mr-2" />
                Emergency Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Automation
                </Button>
                <Button variant="destructive" size="sm">
                  <StopCircle className="h-4 w-4 mr-2" />
                  Emergency Stop
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
