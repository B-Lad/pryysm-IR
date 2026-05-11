"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Droplets, 
  Timer, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Play, 
  Pause, 
  StopCircle,
  ArmRobot,
  Thermometer,
  Beaker,
  Layers,
  Clock,
  Activity,
  Zap,
  Shield,
  Wrench
} from "lucide-react";

// Types
interface ResinPrinter {
  id: string;
  name: string;
  model: "Form 4" | "Form 4L";
  status: "idle" | "printing" | "paused" | "error" | "maintenance";
  currentJob: string | null;
  progress: number;
  estimatedTimeRemaining: number; // minutes
  resinLevel: number; // percentage
  vatClean: boolean;
  buildPlatformAttached: boolean;
  coverClosed: boolean;
  temperature: number; // Celsius
  layerHeight: number; // microns
  totalLayers: number;
  currentLayer: number;
}

interface WashStation {
  id: string;
  name: string;
  model: "Form Wash V2" | "Wash L";
  status: "idle" | "washing" | "draining" | "drying" | "error";
  currentJob: string | null;
  progress: number;
  solventLevel: number; // percentage
  solventQuality: number; // percentage (0-100)
  tankTemperature: number; // Celsius
  agitationSpeed: number; // RPM
  cycleTimeRemaining: number; // minutes
}

interface CureStation {
  id: string;
  name: string;
  model: "Form Cure" | "Cure L";
  status: "idle" | "curing" | "cooling" | "error";
  currentJob: string | null;
  progress: number;
  uvIntensity: number; // mW/cm²
  chamberTemperature: number; // Celsius
  cycleTimeRemaining: number; // minutes
  turntableRotating: boolean;
}

interface RobotArm {
  id: string;
  status: "idle" | "moving" | "gripping" | "error" | "calibrating";
  position: { x: number; y: number; z: number };
  batteryLevel: number; // percentage
  gripperClosed: boolean;
  holdingPlatform: boolean;
  calibrationStatus: "calibrated" | "needs_calibration" | "calibrating";
}

interface PrintJob {
  id: string;
  name: string;
  file: string;
  resinType: string;
  layerHeight: number; // microns
  estimatedPrintTime: number; // minutes
  priority: "low" | "medium" | "high" | "critical";
  status: "queued" | "printing" | "washing" | "curing" | "completed" | "failed";
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

interface GripperJaw {
  id: string;
  type: "standard" | "large_platform" | "custom";
  material: "TPU" | "PLA" | "ABS";
  condition: "excellent" | "good" | "worn" | "replace";
  usageCount: number;
  maxUsage: number;
}

// Mock Data
const mockPrinters: ResinPrinter[] = [
  {
    id: "form4-001",
    name: "Form 4 - Station 1",
    model: "Form 4",
    status: "printing",
    currentJob: "Dental Model Batch #47",
    progress: 67,
    estimatedTimeRemaining: 45,
    resinLevel: 78,
    vatClean: true,
    buildPlatformAttached: true,
    coverClosed: true,
    temperature: 28,
    layerHeight: 50,
    totalLayers: 1200,
    currentLayer: 804,
  },
  {
    id: "form4-002",
    name: "Form 4 - Station 2",
    model: "Form 4",
    status: "idle",
    currentJob: null,
    progress: 0,
    estimatedTimeRemaining: 0,
    resinLevel: 92,
    vatClean: true,
    buildPlatformAttached: false,
    coverClosed: true,
    temperature: 25,
    layerHeight: 50,
    totalLayers: 0,
    currentLayer: 0,
  },
  {
    id: "form4l-001",
    name: "Form 4L - Production",
    model: "Form 4L",
    status: "printing",
    currentJob: "Large Format Prototype",
    progress: 34,
    estimatedTimeRemaining: 180,
    resinLevel: 45,
    vatClean: true,
    buildPlatformAttached: true,
    coverClosed: true,
    temperature: 30,
    layerHeight: 100,
    totalLayers: 800,
    currentLayer: 272,
  },
];

const mockWashStations: WashStation[] = [
  {
    id: "wash-001",
    name: "Form Wash V2 - Unit 1",
    model: "Form Wash V2",
    status: "washing",
    currentJob: "Dental Model Batch #46",
    progress: 45,
    solventLevel: 82,
    solventQuality: 91,
    tankTemperature: 22,
    agitationSpeed: 120,
    cycleTimeRemaining: 8,
  },
  {
    id: "wash-002",
    name: "Form Wash V2 - Unit 2",
    model: "Form Wash V2",
    status: "idle",
    currentJob: null,
    progress: 0,
    solventLevel: 95,
    solventQuality: 98,
    tankTemperature: 21,
    agitationSpeed: 0,
    cycleTimeRemaining: 0,
  },
  {
    id: "washl-001",
    name: "Wash L - Large Format",
    model: "Wash L",
    status: "idle",
    currentJob: null,
    progress: 0,
    solventLevel: 88,
    solventQuality: 95,
    tankTemperature: 23,
    agitationSpeed: 0,
    cycleTimeRemaining: 0,
  },
];

const mockCureStations: CureStation[] = [
  {
    id: "cure-001",
    name: "Form Cure - Unit 1",
    model: "Form Cure",
    status: "curing",
    currentJob: "Dental Model Batch #45",
    progress: 72,
    uvIntensity: 4.2,
    chamberTemperature: 60,
    cycleTimeRemaining: 5,
    turntableRotating: true,
  },
  {
    id: "cure-002",
    name: "Form Cure - Unit 2",
    model: "Form Cure",
    status: "idle",
    currentJob: null,
    progress: 0,
    uvIntensity: 0,
    chamberTemperature: 25,
    cycleTimeRemaining: 0,
    turntableRotating: false,
  },
  {
    id: "curel-001",
    name: "Cure L - Large Format",
    model: "Cure L",
    status: "idle",
    currentJob: null,
    progress: 0,
    uvIntensity: 0,
    chamberTemperature: 24,
    cycleTimeRemaining: 0,
    turntableRotating: false,
  },
];

const mockRobotArm: RobotArm = {
  id: "robot-001",
  status: "idle",
  position: { x: 0, y: 0, z: 0 },
  batteryLevel: 94,
  gripperClosed: false,
  holdingPlatform: false,
  calibrationStatus: "calibrated",
};

const mockJobs: PrintJob[] = [
  {
    id: "job-001",
    name: "Dental Model Batch #47",
    file: "dental_models_batch_47.form",
    resinType: "Draft Resin",
    layerHeight: 50,
    estimatedPrintTime: 135,
    priority: "high",
    status: "printing",
    createdAt: new Date(Date.now() - 7200000),
    startedAt: new Date(Date.now() - 5400000),
  },
  {
    id: "job-002",
    name: "Prototype Housing v3",
    file: "housing_v3.form",
    resinType: "Tough Resin",
    layerHeight: 100,
    estimatedPrintTime: 240,
    priority: "medium",
    status: "queued",
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: "job-003",
    name: "Custom Fixture Set",
    file: "fixtures_set_a.form",
    resinType: "Clear Resin",
    layerHeight: 50,
    estimatedPrintTime: 180,
    priority: "critical",
    status: "queued",
    createdAt: new Date(Date.now() - 1800000),
  },
  {
    id: "job-004",
    name: "Dental Model Batch #46",
    file: "dental_models_batch_46.form",
    resinType: "Draft Resin",
    layerHeight: 50,
    estimatedPrintTime: 130,
    priority: "high",
    status: "washing",
    createdAt: new Date(Date.now() - 14400000),
    startedAt: new Date(Date.now() - 12600000),
    completedAt: new Date(Date.now() - 1800000),
  },
];

const mockGripperJaws: GripperJaw[] = [
  {
    id: "gripper-001",
    type: "standard",
    material: "TPU",
    condition: "excellent",
    usageCount: 47,
    maxUsage: 500,
  },
  {
    id: "gripper-002",
    type: "large_platform",
    material: "TPU",
    condition: "good",
    usageCount: 234,
    maxUsage: 500,
  },
  {
    id: "gripper-003",
    type: "custom",
    material: "TPU",
    condition: "worn",
    usageCount: 478,
    maxUsage: 500,
  },
];

export default function ResinAutomationDashboard() {
  const [printers, setPrinters] = useState<ResinPrinter[]>(mockPrinters);
  const [washStations, setWashStations] = useState<WashStation[]>(mockWashStations);
  const [cureStations, setCureStations] = useState<CureStation[]>(mockCureStations);
  const [robotArm, setRobotArm] = useState<RobotArm>(mockRobotArm);
  const [jobs, setJobs] = useState<PrintJob[]>(mockJobs);
  const [gripperJaws, setGripperJaws] = useState<GripperJaw[]>(mockGripperJaws);
  const [selectedPrinter, setSelectedPrinter] = useState<string | null>(null);
  const [showEmergencyStop, setShowEmergencyStop] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPrinters(prev => prev.map(p => {
        if (p.status === "printing" && p.progress < 100) {
          return {
            ...p,
            progress: Math.min(100, p.progress + 0.5),
            currentLayer: Math.min(p.totalLayers, p.currentLayer + 2),
            estimatedTimeRemaining: Math.max(0, p.estimatedTimeRemaining - 0.5),
          };
        }
        return p;
      }));

      setWashStations(prev => prev.map(w => {
        if (w.status === "washing" && w.progress < 100) {
          return {
            ...w,
            progress: Math.min(100, w.progress + 1),
            cycleTimeRemaining: Math.max(0, w.cycleTimeRemaining - 0.5),
          };
        }
        return w;
      }));

      setCureStations(prev => prev.map(c => {
        if (c.status === "curing" && c.progress < 100) {
          return {
            ...c,
            progress: Math.min(100, c.progress + 0.8),
            cycleTimeRemaining: Math.max(0, c.cycleTimeRemaining - 0.5),
          };
        }
        return c;
      }));
    }, 1000);

    setRefreshInterval(interval);
    return () => clearInterval(interval);
  }, []);

  const handleEmergencyStop = () => {
    setPrinters(prev => prev.map(p => ({
      ...p,
      status: p.status === "printing" ? "paused" : p.status,
    })));
    setWashStations(prev => prev.map(w => ({
      ...w,
      status: w.status === "washing" ? "idle" : w.status,
    })));
    setCureStations(prev => prev.map(c => ({
      ...c,
      status: c.status === "curing" ? "idle" : c.status,
    })));
    setRobotArm(prev => ({ ...prev, status: "idle" }));
    setShowEmergencyStop(false);
  };

  const handleSwapBuildPlatform = (printerId: string) => {
    setRobotArm(prev => ({ ...prev, status: "moving", gripperClosed: false }));
    setTimeout(() => {
      setRobotArm(prev => ({ ...prev, status: "gripping", gripperClosed: true, holdingPlatform: true }));
      setTimeout(() => {
        setPrinters(prev => prev.map(p => 
          p.id === printerId ? { ...p, buildPlatformAttached: false, coverClosed: true } : p
        ));
        setRobotArm(prev => ({ ...prev, status: "moving", holdingPlatform: false }));
        setTimeout(() => {
          setRobotArm(prev => ({ ...prev, status: "calibrating" }));
          setTimeout(() => {
            setRobotArm(prev => ({ ...prev, status: "idle", calibrationStatus: "calibrated" }));
          }, 2000);
        }, 2000);
      }, 3000);
    }, 2000);
  };

  const handleTransferToWash = (printerId: string, washId: string) => {
    setRobotArm(prev => ({ ...prev, status: "moving" }));
    setTimeout(() => {
      setWashStations(prev => prev.map(w => 
        w.id === washId ? { ...w, status: "washing", progress: 0, cycleTimeRemaining: 15 } : w
      ));
      setRobotArm(prev => ({ ...prev, status: "idle" }));
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "printing":
      case "washing":
      case "curing":
      case "moving":
      case "gripping":
        return "bg-blue-500";
      case "idle":
      case "calibrated":
      case "excellent":
        return "bg-green-500";
      case "paused":
      case "good":
        return "bg-yellow-500";
      case "error":
      case "worn":
      case "replace":
      case "needs_calibration":
        return "bg-red-500";
      case "maintenance":
      case "calibrating":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const activeJobs = jobs.filter(j => j.status === "printing" || j.status === "washing" || j.status === "curing").length;
  const queuedJobs = jobs.filter(j => j.status === "queued").length;
  const completedToday = jobs.filter(j => j.status === "completed").length;

  return (
    <div className="w-full max-w-[1800px] mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ArmRobot className="w-8 h-8 text-blue-500" />
            Resin Automation Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Formlabs Form 4 & Form 4L Automated Production Cell
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={autoMode ? "default" : "secondary"} className="px-4 py-2">
            {autoMode ? "🤖 Auto Mode ON" : "🔧 Manual Mode"}
          </Badge>
          <Button
            variant="destructive"
            size="lg"
            onClick={() => setShowEmergencyStop(true)}
            className="gap-2"
          >
            <StopCircle className="w-5 h-5" />
            Emergency Stop
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Activity className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobs}</div>
            <p className="text-xs text-muted-foreground">{queuedJobs} queued</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Printers Running</CardTitle>
            <Layers className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {printers.filter(p => p.status === "printing").length}/{printers.length}
            </div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Robot Status</CardTitle>
            <ArmRobot className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{robotArm.status.replace("_", " ")}</div>
            <p className="text-xs text-muted-foreground">Battery: {robotArm.batteryLevel}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedToday}</div>
            <p className="text-xs text-muted-foreground">100% success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="printers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="printers">Printers</TabsTrigger>
          <TabsTrigger value="washing">Washing</TabsTrigger>
          <TabsTrigger value="curing">Curing</TabsTrigger>
          <TabsTrigger value="robot">Robot Arm</TabsTrigger>
          <TabsTrigger value="jobs">Job Queue</TabsTrigger>
        </TabsList>

        {/* Printers Tab */}
        <TabsContent value="printers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {printers.map((printer) => (
              <Card key={printer.id} className={selectedPrinter === printer.id ? "border-blue-500 border-2" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="w-5 h-5" />
                      {printer.name}
                    </CardTitle>
                    <Badge className={getStatusColor(printer.status)}>
                      {printer.status}
                    </Badge>
                  </div>
                  <CardDescription>{printer.model} • Layer Height: {printer.layerHeight}μm</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {printer.currentJob && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{printer.currentJob}</span>
                        <span className="text-muted-foreground">{Math.round(printer.progress)}%</span>
                      </div>
                      <Progress value={printer.progress} className="h-2" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-blue-500" />
                      <span>ETA: {Math.round(printer.estimatedTimeRemaining)} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span>Resin: {printer.resinLevel}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-orange-500" />
                      <span>{printer.temperature}°C</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-500" />
                      <span>Layer {printer.currentLayer}/{printer.totalLayers}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant={printer.vatClean ? "outline" : "destructive"}>
                      {printer.vatClean ? "✓ VAT Clean" : "⚠ VAT Needs Cleaning"}
                    </Badge>
                    <Badge variant={printer.buildPlatformAttached ? "outline" : "secondary"}>
                      {printer.buildPlatformAttached ? "✓ Platform Attached" : "○ No Platform"}
                    </Badge>
                    <Badge variant={printer.coverClosed ? "outline" : "destructive"}>
                      {printer.coverClosed ? "✓ Cover Closed" : "⚠ Cover Open"}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSwapBuildPlatform(printer.id)}
                      disabled={printer.status === "printing"}
                      className="flex-1"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Swap Platform
                    </Button>
                    <Button
                      size="sm"
                      variant={printer.status === "printing" ? "destructive" : "default"}
                      onClick={() => {
                        setPrinters(prev => prev.map(p => 
                          p.id === printer.id ? { ...p, status: p.status === "printing" ? "paused" : "printing" } : p
                        ));
                      }}
                      className="flex-1"
                    >
                      {printer.status === "printing" ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                      {printer.status === "printing" ? "Pause" : "Resume"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Washing Tab */}
        <TabsContent value="washing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {washStations.map((station) => (
              <Card key={station.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Beaker className="w-5 h-5" />
                      {station.name}
                    </CardTitle>
                    <Badge className={getStatusColor(station.status)}>
                      {station.status}
                    </Badge>
                  </div>
                  <CardDescription>{station.model}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {station.currentJob && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{station.currentJob}</span>
                        <span className="text-muted-foreground">{Math.round(station.progress)}%</span>
                      </div>
                      <Progress value={station.progress} className="h-2" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-blue-500" />
                      <span>Remaining: {Math.round(station.cycleTimeRemaining)} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span>Solvent: {station.solventLevel}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-500" />
                      <span>Quality: {station.solventQuality}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-orange-500" />
                      <span>{station.tankTemperature}°C</span>
                    </div>
                  </div>

                  {station.status === "washing" && (
                    <div className="text-xs text-muted-foreground">
                      Agitation Speed: {station.agitationSpeed} RPM
                    </div>
                  )}

                  {station.solventQuality < 80 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>
                        Solvent quality low. Consider replacement soon.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Curing Tab */}
        <TabsContent value="curing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {cureStations.map((station) => (
              <Card key={station.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      {station.name}
                    </CardTitle>
                    <Badge className={getStatusColor(station.status)}>
                      {station.status}
                    </Badge>
                  </div>
                  <CardDescription>{station.model}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {station.currentJob && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{station.currentJob}</span>
                        <span className="text-muted-foreground">{Math.round(station.progress)}%</span>
                      </div>
                      <Progress value={station.progress} className="h-2" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-blue-500" />
                      <span>Remaining: {Math.round(station.cycleTimeRemaining)} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span>UV: {station.uvIntensity} mW/cm²</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-orange-500" />
                      <span>{station.chamberTemperature}°C</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RotateCcw className={`w-4 h-4 ${station.turntableRotating ? "animate-spin" : ""}`} />
                      <span>{station.turntableRotating ? "Rotating" : "Stopped"}</span>
                    </div>
                  </div>

                  {station.status === "idle" && !station.currentJob && (
                    <p className="text-sm text-muted-foreground">Ready for next batch</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Robot Arm Tab */}
        <TabsContent value="robot" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArmRobot className="w-5 h-5" />
                  Robot Arm Status
                </CardTitle>
                <CardDescription>6-Axis Collaborative Robot</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge className={getStatusColor(robotArm.status)}>{robotArm.status}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Battery Level:</span>
                  <div className="flex items-center gap-2">
                    <Progress value={robotArm.batteryLevel} className="w-32 h-2" />
                    <span className="text-sm">{robotArm.batteryLevel}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Calibration:</span>
                  <Badge variant={robotArm.calibrationStatus === "calibrated" ? "default" : "destructive"}>
                    {robotArm.calibrationStatus.replace("_", " ")}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Gripper:</span>
                  <Badge variant={robotArm.gripperClosed ? "default" : "secondary"}>
                    {robotArm.gripperClosed ? "Closed" : "Open"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Holding Platform:</span>
                  <Badge variant={robotArm.holdingPlatform ? "default" : "secondary"}>
                    {robotArm.holdingPlatform ? "Yes" : "No"}
                  </Badge>
                </div>

                <div className="pt-4">
                  <h4 className="font-medium mb-2">Current Position</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-muted p-2 rounded text-center">
                      <div className="text-xs text-muted-foreground">X</div>
                      <div className="font-mono">{robotArm.position.x.toFixed(2)}</div>
                    </div>
                    <div className="bg-muted p-2 rounded text-center">
                      <div className="text-xs text-muted-foreground">Y</div>
                      <div className="font-mono">{robotArm.position.y.toFixed(2)}</div>
                    </div>
                    <div className="bg-muted p-2 rounded text-center">
                      <div className="text-xs text-muted-foreground">Z</div>
                      <div className="font-mono">{robotArm.position.z.toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setRobotArm(prev => ({ ...prev, status: "calibrating" }))}
                    disabled={robotArm.status !== "idle"}
                    className="flex-1"
                  >
                    <Wrench className="w-4 h-4 mr-2" />
                    Calibrate
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setRobotArm(prev => ({ ...prev, status: "idle", position: { x: 0, y: 0, z: 0 } }))}
                    className="flex-1"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Home Position
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Gripper Jaw Status
                </CardTitle>
                <CardDescription>Custom TPU Gripper Jaws</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {gripperJaws.map((jaw) => (
                  <div key={jaw.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium capitalize">{jaw.type} Gripper</div>
                        <div className="text-xs text-muted-foreground">{jaw.material} • Usage: {jaw.usageCount}/{jaw.maxUsage}</div>
                      </div>
                      <Badge className={getStatusColor(jaw.condition)}>{jaw.condition}</Badge>
                    </div>
                    <Progress value={(jaw.usageCount / jaw.maxUsage) * 100} className="h-2" />
                    {jaw.condition === "worn" || jaw.usageCount > jaw.maxUsage * 0.9 && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>
                          Replace gripper jaw soon - nearing end of life
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Job Queue Tab */}
        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Production Queue</CardTitle>
                <Button size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Add Job
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge className={getPriorityColor(job.priority)}>{job.priority}</Badge>
                        <div>
                          <div className="font-medium">{job.name}</div>
                          <div className="text-xs text-muted-foreground">{job.file}</div>
                        </div>
                      </div>
                      <Badge variant={
                        job.status === "completed" ? "default" :
                        job.status === "failed" ? "destructive" :
                        "secondary"
                      }>
                        {job.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm mt-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Resin Type</div>
                        <div className="font-medium">{job.resinType}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Layer Height</div>
                        <div className="font-medium">{job.layerHeight}μm</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Est. Time</div>
                        <div className="font-medium">{job.estimatedPrintTime} min</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Created</div>
                        <div className="font-medium">{job.createdAt.toLocaleTimeString()}</div>
                      </div>
                    </div>

                    {job.status === "printing" && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Print Progress</span>
                          <span>{printers.find(p => p.currentJob === job.name)?.progress || 0}%</span>
                        </div>
                        <Progress value={printers.find(p => p.currentJob === job.name)?.progress || 0} className="h-2" />
                      </div>
                    )}

                    {(job.status === "washing" || job.status === "curing") && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        Post-processing in progress...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Emergency Stop Dialog */}
      <Dialog open={showEmergencyStop} onOpenChange={setShowEmergencyStop}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <StopCircle className="w-6 h-6" />
              Confirm Emergency Stop
            </DialogTitle>
            <DialogDescription>
              This will immediately pause all printing operations, stop washing and curing cycles, and halt the robot arm.
              This action cannot be undone automatically.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmergencyStop(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleEmergencyStop}>
              <StopCircle className="w-4 h-4 mr-2" />
              Execute Emergency Stop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
