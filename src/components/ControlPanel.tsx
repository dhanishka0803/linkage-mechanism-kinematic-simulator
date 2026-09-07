import React from 'react';
import {
  RotateCcw,
  Home,
  Sliders,
  Play,
  Maximize2,
  Minimize2,
  ChevronDown,
  Info,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { JointAngles, PosePreset } from '../types';
import {
  JOINT_LIMITS,
  HOME_POSITION,
  ZERO_POSITION,
  PRESET_POSES,
  degToRad,
} from '../utils/kinematics';

interface ControlPanelProps {
  targetAngles: JointAngles;
  onChangeJoint: (axis: keyof JointAngles, value: number) => void;
  onSetPose: (pose: JointAngles) => void;
  gripperOpen: boolean;
  onToggleGripper: () => void;
  smoothMotion: boolean;
  onToggleSmoothMotion: () => void;
}

export function ControlPanel({
  targetAngles,
  onChangeJoint,
  onSetPose,
  gripperOpen,
  onToggleGripper,
  smoothMotion,
  onToggleSmoothMotion,
}: ControlPanelProps) {
  const isHome =
    targetAngles.base === HOME_POSITION.base &&
    targetAngles.shoulder === HOME_POSITION.shoulder &&
    targetAngles.elbow === HOME_POSITION.elbow;

  const isZero =
    targetAngles.base === ZERO_POSITION.base &&
    targetAngles.shoulder === ZERO_POSITION.shoulder &&
    targetAngles.elbow === ZERO_POSITION.elbow;

  const handleNudge = (axis: keyof JointAngles, delta: number) => {
    const limit = JOINT_LIMITS[axis];
    const newVal = Math.min(Math.max(targetAngles[axis] + delta, limit.min), limit.max);
    onChangeJoint(axis, newVal);
  };

  return (
    <div
      id="robot-control-panel"
      className="flex flex-col h-full bg-white border-l border-slate-200 text-slate-800 shadow-sm overflow-y-auto"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Axis Configuration
            </h2>
          </div>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200 font-bold">
            3-DOF ACTIVE
          </span>
        </div>
        <div className="text-base font-bold text-slate-800 tracking-tight">
          Joint Actuator Controls
        </div>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Calibrate joint angles and forward kinematics in real-time.
        </p>
      </div>

      {/* Primary Action Buttons (Home & Reset) */}
      <div className="p-6 border-b border-slate-200 bg-white">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          Calibration & Positioning
        </div>
        <div className="grid grid-cols-2 gap-3">
          {/* Home Position Button */}
          <button
            id="btn-home-position"
            type="button"
            onClick={() => onSetPose(HOME_POSITION)}
            className={`w-full py-2.5 px-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs ${
              isHome
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5 shrink-0" />
            <span>Home</span>
          </button>

          {/* Reset Position Button */}
          <button
            id="btn-reset-position"
            type="button"
            onClick={() => onSetPose(ZERO_POSITION)}
            className={`w-full py-2.5 px-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              isZero
                ? 'bg-slate-100 border-2 border-slate-400 text-slate-900'
                : 'border-2 border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>Reset All</span>
          </button>
        </div>
      </div>

      {/* Axis Joint Controls */}
      <div className="p-6 flex-1 space-y-5">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Joint Angle Actuators
          </div>
          <button
            type="button"
            onClick={onToggleSmoothMotion}
            className={`text-xs px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer border ${
              smoothMotion
                ? 'bg-blue-50 text-blue-600 border-blue-200 font-semibold'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
            title="Toggle smooth interpolation vs instant direct motion"
          >
            <Sparkles className="w-3 h-3" />
            <span>{smoothMotion ? 'Smooth Interpolation' : 'Instant Step'}</span>
          </button>
        </div>

        {/* AXIS 1: BASE ROTATION */}
        <div
          id="control-axis-1"
          className="p-4 rounded-xl bg-slate-50 border border-slate-200 transition-all hover:border-blue-400 shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <div>
                <span className="font-semibold text-sm text-slate-700">Axis 1 — Base</span>
                <span className="text-[11px] text-slate-400 ml-1.5 font-normal">(Yaw)</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-base font-bold text-blue-600">
                {targetAngles.base >= 0 ? `+${targetAngles.base}°` : `${targetAngles.base}°`}
              </div>
              <div className="font-mono text-[10px] text-slate-400">
                {degToRad(targetAngles.base).toFixed(2)} rad
              </div>
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-1 my-3">
            <input
              id="slider-axis-1"
              type="range"
              min={JOINT_LIMITS.base.min}
              max={JOINT_LIMITS.base.max}
              step={JOINT_LIMITS.base.step}
              value={targetAngles.base}
              onChange={(e) => onChangeJoint('base', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 px-0.5">
              <span>{JOINT_LIMITS.base.min}°</span>
              <span>0°</span>
              <span>+{JOINT_LIMITS.base.max}°</span>
            </div>
          </div>

          {/* Micro-stepping buttons */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handleNudge('base', -5)}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-xs transition-colors cursor-pointer"
              >
                -5°
              </button>
              <button
                type="button"
                onClick={() => handleNudge('base', -1)}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-xs transition-colors cursor-pointer"
              >
                -1°
              </button>
            </div>
            <button
              type="button"
              onClick={() => onChangeJoint('base', 0)}
              className="px-2 py-0.5 rounded text-[10px] uppercase font-mono text-slate-500 hover:text-blue-600 transition-colors cursor-pointer font-semibold"
            >
              Zero
            </button>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handleNudge('base', 1)}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-xs transition-colors cursor-pointer"
              >
                +1°
              </button>
              <button
                type="button"
                onClick={() => handleNudge('base', 5)}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-xs transition-colors cursor-pointer"
              >
                +5°
              </button>
            </div>
          </div>
        </div>

        {/* AXIS 2: SHOULDER ROTATION */}
        <div
          id="control-axis-2"
          className="p-4 rounded-xl bg-slate-50 border border-slate-200 transition-all hover:border-blue-400 shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <div>
                <span className="font-semibold text-sm text-slate-700">Axis 2 — Shoulder</span>
                <span className="text-[11px] text-slate-400 ml-1.5 font-normal">(Pitch)</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-base font-bold text-blue-600">
                {targetAngles.shoulder >= 0 ? `+${targetAngles.shoulder}°` : `${targetAngles.shoulder}°`}
              </div>
              <div className="font-mono text-[10px] text-slate-400">
                {degToRad(targetAngles.shoulder).toFixed(2)} rad
              </div>
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-1 my-3">
            <input
              id="slider-axis-2"
              type="range"
              min={JOINT_LIMITS.shoulder.min}
              max={JOINT_LIMITS.shoulder.max}
              step={JOINT_LIMITS.shoulder.step}
              value={targetAngles.shoulder}
              onChange={(e) => onChangeJoint('shoulder', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 px-0.5">
              <span>{JOINT_LIMITS.shoulder.min}°</span>
              <span>0° (Up)</span>
              <span>+{JOINT_LIMITS.shoulder.max}°</span>
            </div>
          </div>

          {/* Micro-stepping buttons */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handleNudge('shoulder', -5)}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-xs transition-colors cursor-pointer"
              >
                -5°
              </button>
              <button
                type="button"
                onClick={() => handleNudge('shoulder', -1)}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-xs transition-colors cursor-pointer"
              >
                -1°
              </button>
            </div>
            <button
              type="button"
              onClick={() => onChangeJoint('shoulder', 0)}
              className="px-2 py-0.5 rounded text-[10px] uppercase font-mono text-slate-500 hover:text-blue-600 transition-colors cursor-pointer font-semibold"
            >
              Zero
            </button>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handleNudge('shoulder', 1)}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-xs transition-colors cursor-pointer"
              >
                +1°
              </button>
              <button
                type="button"
                onClick={() => handleNudge('shoulder', 5)}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-xs transition-colors cursor-pointer"
              >
                +5°
              </button>
            </div>
          </div>
        </div>

        {/* AXIS 3: ELBOW ROTATION */}
        <div
          id="control-axis-3"
          className="p-4 rounded-xl bg-slate-50 border border-slate-200 transition-all hover:border-blue-400 shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <div>
                <span className="font-semibold text-sm text-slate-700">Axis 3 — Elbow</span>
                <span className="text-[11px] text-slate-400 ml-1.5 font-normal">(Pitch)</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-base font-bold text-blue-600">
                {targetAngles.elbow >= 0 ? `+${targetAngles.elbow}°` : `${targetAngles.elbow}°`}
              </div>
              <div className="font-mono text-[10px] text-slate-400">
                {degToRad(targetAngles.elbow).toFixed(2)} rad
              </div>
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-1 my-3">
            <input
              id="slider-axis-3"
              type="range"
              min={JOINT_LIMITS.elbow.min}
              max={JOINT_LIMITS.elbow.max}
              step={JOINT_LIMITS.elbow.step}
              value={targetAngles.elbow}
              onChange={(e) => onChangeJoint('elbow', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 px-0.5">
              <span>{JOINT_LIMITS.elbow.min}°</span>
              <span>0°</span>
              <span>+{JOINT_LIMITS.elbow.max}°</span>
            </div>
          </div>

          {/* Micro-stepping buttons */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handleNudge('elbow', -5)}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-xs transition-colors cursor-pointer"
              >
                -5°
              </button>
              <button
                type="button"
                onClick={() => handleNudge('elbow', -1)}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-xs transition-colors cursor-pointer"
              >
                -1°
              </button>
            </div>
            <button
              type="button"
              onClick={() => onChangeJoint('elbow', 0)}
              className="px-2 py-0.5 rounded text-[10px] uppercase font-mono text-slate-500 hover:text-blue-600 transition-colors cursor-pointer font-semibold"
            >
              Zero
            </button>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handleNudge('elbow', 1)}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-xs transition-colors cursor-pointer"
              >
                +1°
              </button>
              <button
                type="button"
                onClick={() => handleNudge('elbow', 5)}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-xs transition-colors cursor-pointer"
              >
                +5°
              </button>
            </div>
          </div>
        </div>

        {/* End-Effector Gripper Section */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="font-semibold text-sm text-slate-700">End-Effector</span>
              <span className="text-xs text-slate-400 ml-1.5 font-normal">— 2-Jaw Gripper</span>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                gripperOpen
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}
            >
              {gripperOpen ? 'OPEN (0.16m)' : 'CLAMPED (0.03m)'}
            </span>
          </div>

          <button
            id="btn-toggle-gripper"
            type="button"
            onClick={onToggleGripper}
            className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border-2 ${
              gripperOpen
                ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-xs'
            }`}
          >
            {gripperOpen ? (
              <>
                <Minimize2 className="w-4 h-4 text-blue-600" />
                <span>Actuate Gripper (Clamp)</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-white" />
                <span>Release Gripper (Open)</span>
              </>
            )}
          </button>
        </div>

        {/* Demonstration Poses */}
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">
            Demonstration Postures
          </div>
          <div className="grid grid-cols-1 gap-2">
            {PRESET_POSES.map((preset) => {
              const isActive =
                targetAngles.base === preset.angles.base &&
                targetAngles.shoulder === preset.angles.shoulder &&
                targetAngles.elbow === preset.angles.elbow;
              return (
                <button
                  key={preset.id}
                  id={`preset-${preset.id}`}
                  type="button"
                  onClick={() => onSetPose(preset.angles)}
                  className={`flex items-center justify-between p-3 rounded-lg text-left text-xs transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-800">{preset.name}</div>
                    <div className="text-[11px] text-slate-400">{preset.description}</div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded font-semibold">
                    [{preset.angles.base}°, {preset.angles.shoulder}°, {preset.angles.elbow}°]
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
