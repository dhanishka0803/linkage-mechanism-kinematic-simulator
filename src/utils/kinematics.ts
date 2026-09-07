import { JointAngles, EndEffectorState, PosePreset } from '../types';

export const ROBOT_DIMENSIONS = {
  baseHeight: 1.0,
  link1Length: 2.2,
  link2Length: 1.8,
  endEffectorLength: 0.5,
};

export const JOINT_LIMITS = {
  base: { min: -180, max: 180, step: 1, default: 0, label: 'Axis 1 — Base Rotation' },
  shoulder: { min: -90, max: 90, step: 1, default: 35, label: 'Axis 2 — Shoulder Pitch' },
  elbow: { min: -135, max: 135, step: 1, default: 50, label: 'Axis 3 — Elbow Pitch' },
};

export const HOME_POSITION: JointAngles = {
  base: 0,
  shoulder: 35,
  elbow: 50,
};

export const ZERO_POSITION: JointAngles = {
  base: 0,
  shoulder: 0,
  elbow: 0,
};

export const PRESET_POSES: PosePreset[] = [
  {
    id: 'home',
    name: 'Home Position',
    description: 'Standard upright ready stance',
    angles: { ...HOME_POSITION },
  },
  {
    id: 'zero',
    name: 'Reset / Zero Pose',
    description: 'All 3 joint axes at 0° straight vertical',
    angles: { ...ZERO_POSITION },
  },
  {
    id: 'reach',
    name: 'Forward Reach',
    description: 'Extended forward reach for pick & place',
    angles: { base: 0, shoulder: 65, elbow: 40 },
  },
  {
    id: 'ground_pick',
    name: 'Floor Pick',
    description: 'Lowered position reaching down near ground level',
    angles: { base: -45, shoulder: 75, elbow: 85 },
  },
  {
    id: 'overhead',
    name: 'Overhead Inspect',
    description: 'Elevated posture angled for high inspection',
    angles: { base: 45, shoulder: -20, elbow: 30 },
  },
];

/**
 * Calculates Forward Kinematics (FK) for 3-DOF robot arm
 */
export function calculateForwardKinematics(
  angles: JointAngles,
  gripperOpen = true
): EndEffectorState {
  const theta1 = (angles.base * Math.PI) / 180;
  const theta2 = (angles.shoulder * Math.PI) / 180;
  const theta3 = (angles.elbow * Math.PI) / 180;

  const h0 = ROBOT_DIMENSIONS.baseHeight;
  const l1 = ROBOT_DIMENSIONS.link1Length;
  const l2 = ROBOT_DIMENSIONS.link2Length;
  const lee = ROBOT_DIMENSIONS.endEffectorLength;
  const l2Total = l2 + lee;

  // Local radial distance in arm vertical plane
  // When theta2=0, arm link 1 points straight up (+Y)
  // Positive theta2 tilts arm along +X
  const r = l1 * Math.sin(theta2) + l2Total * Math.sin(theta2 + theta3);
  const y = h0 + l1 * Math.cos(theta2) + l2Total * Math.cos(theta2 + theta3);

  // Rotation about vertical Y by theta1
  const x = r * Math.cos(theta1);
  const z = -r * Math.sin(theta1);
  const reach = Math.hypot(x, z);

  return {
    x: Number(x.toFixed(3)),
    y: Number(y.toFixed(3)),
    z: Number(z.toFixed(3)),
    reach: Number(reach.toFixed(3)),
    gripperOpen,
  };
}

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}
