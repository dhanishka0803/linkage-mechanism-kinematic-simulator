/**
 * Types and interfaces for the 3-Axis Robotic Arm Simulation
 */

export interface JointAngles {
  /** Axis 1: Base rotation about Y-axis (degrees, -180 to +180) */
  base: number;
  /** Axis 2: Shoulder pitch rotation (degrees, -90 to +90) */
  shoulder: number;
  /** Axis 3: Elbow pitch rotation (degrees, -135 to +135) */
  elbow: number;
}

export interface EndEffectorState {
  x: number;
  y: number;
  z: number;
  reach: number;
  gripperOpen: boolean;
}

export interface PosePreset {
  id: string;
  name: string;
  description: string;
  angles: JointAngles;
}

export type CameraViewPreset = 'iso' | 'top' | 'front' | 'side';

export interface ViewOptions {
  showGrid: boolean;
  showAxes: boolean;
  showJointIndicators: boolean;
  showTrajectory: boolean;
  smoothMotion: boolean;
}
