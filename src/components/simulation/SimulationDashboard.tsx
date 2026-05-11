"use client";

import React, { useState, useEffect } from 'react';

interface SimulationMetrics {
  activePrints: number;
  completedJobs: number;
  materialUsage: number;
  energyConsumption: number;
  estimatedCompletion: string;
}

interface SimulationDashboardProps {
  printerId?: string;
  mode?: 'full' | 'compact';
}

export function SimulationDashboard({ printerId, mode = 'full' }: SimulationDashboardProps) {
  const [metrics, setMetrics] = useState<SimulationMetrics>({
    activePrints: 0,
    completedJobs: 0,
    materialUsage: 0,
    energyConsumption: 0,
    estimatedCompletion: '--:--',
  });
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Simulate real-time metrics updates
    const interval = setInterval(() => {
      if (isRunning) {
        setMetrics(prev => ({
          ...prev,
          activePrints: Math.floor(Math.random() * 5) + 1,
          completedJobs: prev.completedJobs + Math.floor(Math.random() * 2),
          materialUsage: prev.materialUsage + Math.random() * 0.5,
          energyConsumption: prev.energyConsumption + Math.random() * 10,
        }));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const startSimulation = () => {
    setIsRunning(true);
  };

  const stopSimulation = () => {
    setIsRunning(false);
  };

  if (mode === 'compact') {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-2">Simulation Status</h3>
        <div className="flex items-center gap-4">
          <span className={`px-2 py-1 rounded ${isRunning ? 'bg-green-600' : 'bg-gray-600'} text-white text-sm`}>
            {isRunning ? 'Running' : 'Stopped'}
          </span>
          <span className="text-gray-300">Active Prints: {metrics.activePrints}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Simulation Dashboard</h2>
        <div className="flex gap-2">
          {!isRunning ? (
            <button
              onClick={startSimulation}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
            >
              Start Simulation
            </button>
          ) : (
            <button
              onClick={stopSimulation}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
            >
              Stop Simulation
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700 rounded p-4">
          <h3 className="text-gray-400 text-sm">Active Prints</h3>
          <p className="text-2xl font-bold text-white">{metrics.activePrints}</p>
        </div>
        <div className="bg-gray-700 rounded p-4">
          <h3 className="text-gray-400 text-sm">Completed Jobs</h3>
          <p className="text-2xl font-bold text-white">{metrics.completedJobs}</p>
        </div>
        <div className="bg-gray-700 rounded p-4">
          <h3 className="text-gray-400 text-sm">Material Usage (kg)</h3>
          <p className="text-2xl font-bold text-white">{metrics.materialUsage.toFixed(2)}</p>
        </div>
        <div className="bg-gray-700 rounded p-4">
          <h3 className="text-gray-400 text-sm">Energy (kWh)</h3>
          <p className="text-2xl font-bold text-white">{metrics.energyConsumption.toFixed(1)}</p>
        </div>
      </div>

      <div className="bg-gray-700 rounded p-4">
        <h3 className="text-gray-400 text-sm mb-2">Estimated Completion</h3>
        <p className="text-xl text-white">{metrics.estimatedCompletion}</p>
      </div>
    </div>
  );
}

export default SimulationDashboard;
