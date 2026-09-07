/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Cpu,
  RotateCcw,
  Home,
  Sliders,
  Maximize,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import * as THREE from 'three';
import { JointAngles, ViewOptions, CameraViewPreset, EndEffectorState } from './types';
import {
  HOME_POSITION,
  ZERO_POSITION,
  calculateForwardKinematics,
} from './utils/kinematics';
import { RoboticArmScene } from './components/RoboticArmScene';
import { ControlPanel } from './components/ControlPanel';
import { TelemetryOverlay } from './components/TelemetryOverlay';

export default function App() {
  // Target joint angles set by UI controls (in degrees)
  const [targetAngles, setTargetAngles] = useState<JointAngles>(HOME_POSITION);

  // Current interpolated joint angles ref for smooth 60fps rendering in Three.js
  const currentAngles = useRef<JointAngles>({ ...HOME_POSITION });

  // Gripper open/close state
  const [gripperOpen, setGripperOpen] = useState<boolean>(true);

  // 3D Scene View Options
  const [viewOptions, setViewOptions] = useState<ViewOptions>({
    showGrid: true,
    showAxes: true,
    showJointIndicators: true,
    showTrajectory: true,
    smoothMotion: true,
  });

  // Camera viewpoint preset
  const [cameraPreset, setCameraPreset] = useState<CameraViewPreset>('iso');

  // Sidebar visibility for responsive mobile or compact display
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Real-time End-Effector Cartesian coordinates
  const [endEffector, setEndEffector] = useState<EndEffectorState>(() =>
    calculateForwardKinematics(HOME_POSITION, true)
  );

  // Update FK whenever target angles or gripper change
  const updateKinematics = useCallback((angles: JointAngles, gripper: boolean) => {
    const fk = calculateForwardKinematics(angles, gripper);
    setEndEffector(fk);
  }, []);

  const handleJointChange = (axis: keyof JointAngles, value: number) => {
    setTargetAngles((prev) => {
      const next = { ...prev, [axis]: value };
      updateKinematics(next, gripperOpen);
      return next;
    });
  };

  const handleSetPose = (newPose: JointAngles) => {
    setTargetAngles(newPose);
    updateKinematics(newPose, gripperOpen);
  };

  const handleToggleGripper = () => {
    setGripperOpen((prev) => {
      const next = !prev;
      updateKinematics(targetAngles, next);
      return next;
    });
  };

  const handleToggleOption = (key: keyof ViewOptions) => {
    setViewOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Optional: Update TCP from actual 3D mesh matrix
  const handleTcpPositionChange = useCallback((pos: THREE.Vector3) => {
    // Verified 3D world position
    // We can keep state aligned
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f8fafc] text-[#1e293b] font-sans select-none">
      {/* Top Application Bar - Sleek Interface Header */}
      <header className="h-16 shrink-0 bg-white border-b border-slate-200 shadow-xs flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white shadow-xs">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-800 uppercase">
              KinematicSim <span className="text-xs font-mono text-blue-600 font-semibold lowercase">v1.2</span>
            </h1>
            <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
              // 3-Axis Robotic Arm Simulation
            </span>
          </div>

          {/* System Status Indicators from Sleek Interface Theme */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium ml-4 pl-4 border-l border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">System Online</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Target:</span>
              <span className="text-blue-600 font-mono font-semibold">RX-750 End Effector</span>
            </div>
          </div>
        </div>

        {/* Header Action Shortcuts */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => handleSetPose(HOME_POSITION)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer shadow-xs"
            title="Reset to canonical home posture"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home Position</span>
          </button>

          <button
            type="button"
            onClick={() => handleSetPose(ZERO_POSITION)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Reset all joint angles to 0°"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset All</span>
          </button>

          {/* Toggle Sidebar Button for smaller screens */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-colors cursor-pointer lg:hidden ${
              isSidebarOpen
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Panel</span>
          </button>
        </div>
      </header>

      {/* Main Simulation Viewport & Controls Area */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* 3D Canvas Viewport */}
        <main className="relative flex-1 h-full w-full overflow-hidden">
          <RoboticArmScene
            targetAngles={targetAngles}
            currentAngles={currentAngles}
            gripperOpen={gripperOpen}
            viewOptions={viewOptions}
            cameraPreset={cameraPreset}
            onTcpPositionChange={handleTcpPositionChange}
          />

          {/* HUD Overlay for Telemetry and Controls */}
          <TelemetryOverlay
            endEffector={endEffector}
            viewOptions={viewOptions}
            onToggleOption={handleToggleOption}
            cameraPreset={cameraPreset}
            onSelectCameraPreset={setCameraPreset}
          />
        </main>

        {/* Right Sidebar Control Panel */}
        <aside
          className={`absolute lg:relative top-0 right-0 h-full z-30 transition-transform duration-300 ease-in-out w-80 sm:w-96 shrink-0 ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          <ControlPanel
            targetAngles={targetAngles}
            onChangeJoint={handleJointChange}
            onSetPose={handleSetPose}
            gripperOpen={gripperOpen}
            onToggleGripper={handleToggleGripper}
            smoothMotion={viewOptions.smoothMotion}
            onToggleSmoothMotion={() => handleToggleOption('smoothMotion')}
          />
        </aside>
      </div>

      {/* Bottom Status Footer from Sleek Interface Theme */}
      <footer className="h-10 shrink-0 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-[10px] text-slate-400 font-mono z-20">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            LATENCY: 12ms
          </span>
          <span>FPS: 60.0</span>
          <span className="hidden sm:inline">CYCLE: 100Hz</span>
        </div>
        <div className="uppercase tracking-widest font-semibold text-slate-500 hidden sm:block">
          Industrial Automation Interface Prototype // 2026
        </div>
      </footer>
    </div>
  );
}
