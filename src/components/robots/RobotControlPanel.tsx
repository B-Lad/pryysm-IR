import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
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
  WifiOff
} from 'lucide-react';

interface RobotStatus {
  id: string;
  robotId: string;
  isConnected: boolean;
  isBusy: boolean;
  currentTask?: string;
  position?: { x: number; y: number; z: number; rx: number; ry: number; rz: number };
  lastHeartbeat: string;
}

interface QueueStatus {
  pending: number;
  processing: boolean;
}

export function RobotControlPanel() {
  const [robots, setRobots] = useState<RobotStatus[]>([]);
  const [queueStatus, setQueueStatus] = useState<QueueStatus>({ pending: 0, processing: false });
  const [loading, setLoading] = useState(true);
  const [emergencyStopTriggered, setEmergencyStopTriggered] = useState(false);

  const fetchRobotStatus = async () => {
    try {
      const response = await fetch('/api/robots');
      const data = await response.json();
      
      if (data.success) {
        setRobots(data.data || []);
        setQueueStatus(data.queueStatus || { pending: 0, processing: false });
      }
    } catch (error) {
      console.error('Failed to fetch robot status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRobotStatus();
    const interval = setInterval(fetchRobotStatus, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

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
        fetchRobotStatus();
      }
    } catch (error) {
      console.error('Emergency stop failed:', error);
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

  const getStatusBadge = (robot: RobotStatus) => {
    if (!robot.isConnected) {
      return <Badge variant="destructive">Offline</Badge>;
    }
    if (robot.isBusy) {
      return <Badge variant="default">Working</Badge>;
    }
    return <Badge variant="secondary">Idle</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Clock className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading robots...</span>
      </div>
    );
  }

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

      {/* Control Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Robot Control Center</h2>
          <p className="text-muted-foreground">
            Managing {robots.length} robots | Queue: {queueStatus.pending} pending
          </p>
        </div>
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

      {/* Robots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {robots.map((robot) => (
          <Card key={robot.id} className={`${!robot.isConnected ? 'border-red-200 bg-red-50' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getStatusIcon(robot)}
                  <CardTitle className="text-lg">{robot.robotId}</CardTitle>
                </div>
                {getStatusBadge(robot)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span>{robot.isConnected ? 'Connected' : 'Disconnected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Activity:</span>
                  <span>{robot.isBusy ? 'Busy' : 'Idle'}</span>
                </div>
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
              <Button>
                <Play className="h-4 w-4 mr-2" />
                Add Robot
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{robots.filter(r => r.isConnected).length}</p>
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
                <p className="text-2xl font-bold">{robots.filter(r => r.isBusy).length}</p>
                <p className="text-sm text-muted-foreground">Working</p>
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
                <p className="text-sm text-muted-foreground">Queued Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{robots.filter(r => !r.isConnected).length}</p>
                <p className="text-sm text-muted-foreground">Offline</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
