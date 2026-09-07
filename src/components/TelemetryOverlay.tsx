import React from 'react';
import {
  Compass,
  Grid,
  Eye,
  Camera,
  Activity,
  Maximize,
  HelpCircle,
  Footprints,
} from 'lucide-react';
import { EndEffectorState, ViewOptions, CameraViewPreset } from '../types';

interface TelemetryOverlayProps {
  endEffector: EndEffectorState;
  viewOptions: ViewOptions;
  onToggleOption: (key: keyof ViewOptions) => void;
  cameraPreset: CameraViewPreset;
  onSelectCameraPreset: (preset: CameraViewPreset) => void;
}

export function TelemetryOverlay({
  endEffector,
  viewOptions,
  onToggleOption,
  cameraPreset,
  onSelectCameraPreset,
}: TelemetryOverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 flex flex-col justify-between overflow-hidden">
      {/* Top Bar: Position Vector & Camera Views */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pointer-events-auto">
        {/* End-Effector Cartesian Position Vector Card (Sleek Interface) */}
        <div
          id="hud-telemetry-card"
          className="bg-slate-800/85 backdrop-blur-md border border-slate-700 p-4 rounded-xl text-white shadow-xl min-w-[220px]"
        >
          <div className="flex items-center justify-between mb-3 border-b border-slate-700/80 pb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Position Vector (TCP)
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-red-400">X_COORD:</span>
              <span className="font-bold text-slate-100">
                {endEffector.x >= 0 ? `+${endEffector.x.toFixed(2)}` : endEffector.x.toFixed(2)} m
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-green-400">Y_COORD:</span>
              <span className="font-bold text-slate-100">
                {endEffector.y >= 0 ? `+${endEffector.y.toFixed(2)}` : endEffector.y.toFixed(2)} m
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-blue-400">Z_COORD:</span>
              <span className="font-bold text-slate-100">
                {endEffector.z >= 0 ? `+${endEffector.z.toFixed(2)}` : endEffector.z.toFixed(2)} m
              </span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-700/80 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">RADIAL REACH:</span>
            <span className="text-blue-400 font-bold">{endEffector.reach.toFixed(2)} m</span>
          </div>
        </div>

        {/* Camera Perspective Presets */}
        <div
          id="camera-preset-controls"
          className="bg-slate-800/85 backdrop-blur-md border border-slate-700 rounded-xl p-1.5 shadow-xl flex items-center gap-1 text-xs"
        >
          <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider hidden md:block">
            View
          </div>
          <button
            type="button"
            onClick={() => onSelectCameraPreset('iso')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              cameraPreset === 'iso'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            3D Orbit
          </button>
          <button
            type="button"
            onClick={() => onSelectCameraPreset('top')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              cameraPreset === 'top'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            Top (X-Z)
          </button>
          <button
            type="button"
            onClick={() => onSelectCameraPreset('front')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              cameraPreset === 'front'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            Front (X-Y)
          </button>
          <button
            type="button"
            onClick={() => onSelectCameraPreset('side')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              cameraPreset === 'side'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            Side (Z-Y)
          </button>
        </div>
      </div>

      {/* Middle/Bottom Axis Legend (Matching Sleek Interface Spec) */}
      <div className="hidden md:flex justify-center pointer-events-auto">
        <div className="flex gap-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-800/80 backdrop-blur-md border border-slate-700 px-4 py-1.5 rounded-full shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 border border-red-500 bg-red-500/30 rounded-xs" />
            <span>X-Axis (Forward)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 border border-green-500 bg-green-500/30 rounded-xs" />
            <span>Y-Axis (Vertical)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 border border-blue-500 bg-blue-500/30 rounded-xs" />
            <span>Z-Axis (Lateral)</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar: 3D Scene Visibility Toggles & Viewport Help */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 pointer-events-auto">
        {/* Layer / Visualizer Toggles */}
        <div
          id="scene-visualizer-toggles"
          className="bg-slate-800/85 backdrop-blur-md border border-slate-700 rounded-xl p-1.5 shadow-xl flex flex-wrap items-center gap-1 text-xs"
        >
          <button
            type="button"
            onClick={() => onToggleOption('showGrid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs font-medium ${
              viewOptions.showGrid
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleOption('showAxes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs font-medium ${
              viewOptions.showAxes
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-red-400" />
            <span>Axes</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleOption('showJointIndicators')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs font-medium ${
              viewOptions.showJointIndicators
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span>Joint Rings</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleOption('showTrajectory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs font-medium ${
              viewOptions.showTrajectory
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Footprints className="w-3.5 h-3.5 text-emerald-400" />
            <span>Trajectory</span>
          </button>
        </div>

        {/* Viewport Nav Hint */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-800/70 backdrop-blur-sm border border-slate-700/80 rounded-lg px-3 py-1.5 text-[11px] text-slate-300">
          <span>
            <strong className="text-white">Rotate:</strong> Left Click + Drag
          </span>
          <span>•</span>
          <span>
            <strong className="text-white">Pan:</strong> Right Click + Drag
          </span>
          <span>•</span>
          <span>
            <strong className="text-white">Zoom:</strong> Scroll Wheel
          </span>
        </div>
      </div>
    </div>
  );
}
