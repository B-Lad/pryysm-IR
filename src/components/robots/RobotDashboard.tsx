import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Progress } from '@/src/components/ui/progress';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { useToast } from '@/src/hooks/use-toast';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Circle,
  Clock,
  Cpu,
  Play,
  Square,
  StopCircle,
  Wifi,
  WifiOff,
  Plus,
  Trash2,
  RefreshCw,
  List,
  Settings,
  Zap,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

interface RobotStatus {
  id: string;
  robotId: string;
  name?: string;
  vendor?: string;
  isConnected: boolean;
  isBusy: boolean;
  currentTask?: string;
  position?: { x: number; y: number; z: number; rx: number; ry: number; rz: number };
  lastHeartbeat: string;
}

interface Task {
  id: string;
  robotId: string;
  printerId: string;
  taskType: RobotTaskType;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  priority: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
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

interface QueueStatus {
  pending: number;
  processing: boolean;
}

interface RobotConfig {
  name: string;
  vendor: 'ABB' | 'FANUC' | 'YASKAWA' | 'KUKA';
  model: string;
  ipAddress: string;
  port: number;
  protocol: 'MODBUS_TCP' | 'OPC_UA' | 'REST_API';
  stationId: string;
  isActive: boolean;
  // SLA/Dental specific
  supportedPrinters?: string[];
  hasCustomGripper?: boolean;
  gripperType?: 'BUILD_PLATFORM' | 'BASKET' | 'UNIVERSAL';
}

export function RobotDashboard() {
  const [robots, setRobots] = useState<RobotStatus[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [queueStatus, setQueueStatus] = useState<QueueStatus>({ pending: 0, processing: false });
  const [loading, setLoading] = useState(true);
  const [emergencyStopTriggered, setEmergencyStopTriggered] = useState(false);
  const [isAddRobotOpen, setIsAddRobotOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const [newRobot, setNewRobot] = useState<RobotConfig>({
    name: '',
    vendor: 'ABB',
    model: '',
    ipAddress: '',
    port: 502,
    protocol: 'MODBUS_TCP',
    stationId: '',
    isActive: true,
  });

  const [newTask, setNewTask] = useState({
    robotId: '',
    printerId: '',
    taskType: 'BUILD_PLATFORM_REMOVAL' as RobotTaskType,
    priority: 5,
  });

  const fetchData = async () => {
    try {
      const [robotsRes, tasksRes] = await Promise.all([
        fetch('/api/robots'),
        fetch('/api/robots/tasks'),
      ]);

      const robotsData = await robotsRes.json();
      const tasksData = await tasksRes.json();

      if (robotsData.success) {
        setRobots(robotsData.data || []);
        setQueueStatus(robotsData.queueStatus || { pending: 0, processing: false });
      }

      if (tasksData.success) {
        setTasks(tasksData.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch robot data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleEmergencyStop = async () => {
    if (!confirm('⚠️ CRITICAL: This will stop ALL robots immediately. Continue?')) {
      return;
    }

    try {
      const response = await fetch('/api/robots/emergency-stop', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        setEmergencyStopTriggered(true);
        setTimeout(() => setEmergencyStopTriggered(false), 3000);
        fetchData();
        toast({
          title: 'Emergency Stop Activated',
          description: 'All robots have been stopped',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Emergency stop failed:', error);
      toast({
        title: 'Error',
        description: 'Emergency stop failed',
        variant: 'destructive',
      });
    }
  };

  const handleAddRobot = async () => {
    try {
      const response = await fetch('/api/robots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRobot),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Robot Added',
          description: `${newRobot.name} has been registered successfully`,
        });
        setIsAddRobotOpen(false);
        setNewRobot({
          name: '',
          vendor: 'ABB',
          model: '',
          ipAddress: '',
          port: 502,
          protocol: 'MODBUS_TCP',
          stationId: '',
          isActive: true,
        });
        fetchData();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to add robot:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add robot',
        variant: 'destructive',
      });
    }
  };

  const handleCreateTask = async () => {
    try {
      const response = await fetch('/api/robots/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Task Created',
          description: `Task ${data.data.id} has been queued`,
        });
        setIsCreateTaskOpen(false);
        fetchData();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create task',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRobot = async (robotId: string) => {
    if (!confirm(`Are you sure you want to remove robot ${robotId}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/robots?id=${robotId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Robot Removed',
          description: `${robotId} has been removed`,
        });
        fetchData();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to delete robot:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete robot',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (robot: RobotStatus) => {
    if (!robot.isConnected) {
      return <WifiOff className="h-5 w-5 text-red-500" />;
    }
    if (robot.isBusy) {
      return <Activity className="h-5 w-5 text-blue-500 animate-pulse" />;
    }
    return <Wifi className="h-5 w-5 text-green-500" />;
  };

  const getTaskStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="secondary"><Activity className="h-3 w-3 mr-1" /> In Progress</Badge>;
      case 'FAILED':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };

  const getTaskTypeColor = (type: Task['taskType']) => {
    // FDM tasks
    switch (type) {
      case 'PART_REMOVAL':
        return 'text-blue-500';
      case 'BED_PREP':
        return 'text-green-500';
      case 'INSPECTION':
        return 'text-purple-500';
      case 'MATERIAL_LOAD':
        return 'text-orange-500';
      
      // SLA/Dental tasks
      case 'BUILD_PLATFORM_REMOVAL':
        return 'text-cyan-500';
      case 'DOOR_OPEN':
      case 'DOOR_CLOSE':
        return 'text-gray-500';
      case 'BASKET_TRANSFER':
        return 'text-indigo-500';
      case 'WASH_LOAD':
      case 'WASH_UNLOAD':
        return 'text-blue-400';
      case 'CURE_LOAD':
      case 'CURE_UNLOAD':
        return 'text-amber-500';
      case 'DENTAL_MODEL_INSPECTION':
        return 'text-pink-500';
      case 'PLATFORM_CLEANING':
        return 'text-teal-500';
      case 'RESIN_REFILL':
        return 'text-violet-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  const onlineRobots = robots.filter(r => r.isConnected).length;
  const busyRobots = robots.filter(r => r.isBusy).length;
  const offlineRobots = robots.filter(r => !r.isConnected).length;
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const failedTasks = tasks.filter(t => t.status === 'FAILED').length;

  return (
    <div className="space-y-6">
      {/* Emergency Stop Banner */}
      {emergencyStopTriggered && (
        <div className="bg-red-600 text-white p-4 rounded-lg flex items-center gap-3 animate-pulse">
          <StopCircle className="h-6 w-6" />
          <div>
            <h3 className="font-bold">EMERGENCY STOP ACTIVATED</h3>
            <p className="text-sm">All robots have been stopped</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Robot Control Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your 3D print farm automation system
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog open={isAddRobotOpen} onOpenChange={setIsAddRobotOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Robot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Robot</DialogTitle>
                <DialogDescription>
                  Register a new industrial robot to your print farm
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Robot Name</Label>
                    <Input
                      id="name"
                      value={newRobot.name}
                      onChange={(e) => setNewRobot({ ...newRobot, name: e.target.value })}
                      placeholder="Robot-01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vendor">Vendor</Label>
                    <Select
                      value={newRobot.vendor}
                      onValueChange={(value: any) => setNewRobot({ ...newRobot, vendor: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ABB">ABB</SelectItem>
                        <SelectItem value="FANUC">FANUC</SelectItem>
                        <SelectItem value="YASKAWA">Yaskawa</SelectItem>
                        <SelectItem value="KUKA">KUKA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={newRobot.model}
                    onChange={(e) => setNewRobot({ ...newRobot, model: e.target.value })}
                    placeholder="IRB 1200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ipAddress">IP Address</Label>
                    <Input
                      id="ipAddress"
                      value={newRobot.ipAddress}
                      onChange={(e) => setNewRobot({ ...newRobot, ipAddress: e.target.value })}
                      placeholder="192.168.1.100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      type="number"
                      value={newRobot.port}
                      onChange={(e) => setNewRobot({ ...newRobot, port: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="stationId">Station ID</Label>
                  <Input
                    id="stationId"
                    value={newRobot.stationId}
                    onChange={(e) => setNewRobot({ ...newRobot, stationId: e.target.value })}
                    placeholder="STATION-01"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddRobotOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRobot}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Robot
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
            <DialogTrigger asChild>
              <Button>
                <Zap className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Queue a new task for robot execution
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="robotId">Robot</Label>
                  <Select
                    value={newTask.robotId}
                    onValueChange={(value) => setNewTask({ ...newTask, robotId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select robot" />
                    </SelectTrigger>
                    <SelectContent>
                      {robots.map((robot) => (
                        <SelectItem key={robot.id} value={robot.id}>
                          {robot.robotId} {robot.isConnected ? '(Online)' : '(Offline)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="printerId">Printer ID</Label>
                  <Input
                    id="printerId"
                    value={newTask.printerId}
                    onChange={(e) => setNewTask({ ...newTask, printerId: e.target.value })}
                    placeholder="PRINTER-01"
                  />
                </div>
                <div>
                  <Label htmlFor="taskType">Task Type</Label>
                  <Select
                    value={newTask.taskType}
                    onValueChange={(value: any) => setNewTask({ ...newTask, taskType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {/* FDM Tasks */}
                      <SelectItem value="PART_REMOVAL">Part Removal (FDM)</SelectItem>
                      <SelectItem value="BED_PREP">Bed Preparation (FDM)</SelectItem>
                      <SelectItem value="INSPECTION">Inspection (FDM)</SelectItem>
                      <SelectItem value="MATERIAL_LOAD">Material Load (FDM)</SelectItem>
                      
                      {/* SLA/Dental Tasks */}
                      <SelectItem value="BUILD_PLATFORM_REMOVAL">Build Platform Removal (SLA)</SelectItem>
                      <SelectItem value="DOOR_OPEN">Open Printer Door</SelectItem>
                      <SelectItem value="DOOR_CLOSE">Close Printer Door</SelectItem>
                      <SelectItem value="BASKET_TRANSFER">Basket Transfer</SelectItem>
                      <SelectItem value="WASH_LOAD">Load Wash Station</SelectItem>
                      <SelectItem value="WASH_UNLOAD">Unload Wash Station</SelectItem>
                      <SelectItem value="CURE_LOAD">Load Cure Station</SelectItem>
                      <SelectItem value="CURE_UNLOAD">Unload Cure Station</SelectItem>
                      <SelectItem value="DENTAL_MODEL_INSPECTION">Dental Model Inspection</SelectItem>
                      <SelectItem value="PLATFORM_CLEANING">Platform Cleaning</SelectItem>
                      <SelectItem value="RESIN_REFILL">Resin Refill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority (1-10, 1=highest)</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="10"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateTaskOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTask}>
                  <Zap className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            variant="destructive"
            size="lg"
            onClick={handleEmergencyStop}
            className="gap-2"
          >
            <StopCircle className="h-5 w-5" />
            EMERGENCY STOP
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{onlineRobots}</p>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{busyRobots}</p>
                <p className="text-sm text-muted-foreground">Working</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <WifiOff className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{offlineRobots}</p>
                <p className="text-sm text-muted-foreground">Offline</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{queueStatus.pending}</p>
                <p className="text-sm text-muted-foreground">Queued</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{completedTasks}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{failedTasks}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="robots" className="space-y-4">
        <TabsList>
          <TabsTrigger value="robots">
            <Cpu className="h-4 w-4 mr-2" />
            Robots
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <List className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="robots" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {robots.map((robot) => (
              <Card key={robot.id} className={`${!robot.isConnected ? 'border-red-200 bg-red-50' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(robot)}
                      <div>
                        <CardTitle className="text-lg">{robot.robotId}</CardTitle>
                        {robot.vendor && (
                          <p className="text-xs text-muted-foreground">{robot.vendor}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={!robot.isConnected ? 'destructive' : robot.isBusy ? 'default' : 'secondary'}>
                        {!robot.isConnected ? 'Offline' : robot.isBusy ? 'Working' : 'Idle'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleteRobot(robot.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {robot.currentTask && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Task:</span>
                        <span className="truncate max-w-[150px]">{robot.currentTask}</span>
                      </div>
                    )}
                    {robot.position && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Position:</p>
                        <div className="grid grid-cols-3 gap-1 text-xs font-mono">
                          <span>X: {robot.position.x.toFixed(1)}</span>
                          <span>Y: {robot.position.y.toFixed(1)}</span>
                          <span>Z: {robot.position.z.toFixed(1)}</span>
                        </div>
                      </div>
                    )}
                    <div className="pt-2 border-t flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Square className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {robots.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <Cpu className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Robots Configured</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first robot to start automating your 3D print farm
                  </p>
                  <Button onClick={() => setIsAddRobotOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Robot
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Queue</CardTitle>
              <CardDescription>
                View and manage all robot tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task ID</TableHead>
                      <TableHead>Robot</TableHead>
                      <TableHead>Printer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-mono text-xs">{task.id}</TableCell>
                        <TableCell>{task.robotId}</TableCell>
                        <TableCell>{task.printerId}</TableCell>
                        <TableCell className={getTaskTypeColor(task.taskType)}>
                          {task.taskType.replace('_', ' ')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={(11 - task.priority) * 10} className="w-20 h-2" />
                            <span className="text-xs">{task.priority}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getTaskStatusBadge(task.status)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(task.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    {tasks.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No tasks found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
