import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { JointAngles } from '../types';
import { ROBOT_DIMENSIONS, degToRad } from '../utils/kinematics';

interface RoboticArmMeshProps {
  targetAngles: JointAngles;
  currentAngles: React.MutableRefObject<JointAngles>;
  gripperOpen: boolean;
  showIndicators: boolean;
  smoothMotion: boolean;
  onTcpUpdate?: (pos: THREE.Vector3) => void;
}

export function RoboticArmMesh({
  targetAngles,
  currentAngles,
  gripperOpen,
  showIndicators,
  smoothMotion,
  onTcpUpdate,
}: RoboticArmMeshProps) {
  // Three.js object references for kinematic chain
  const baseTurretRef = useRef<THREE.Group>(null);
  const shoulderJointRef = useRef<THREE.Group>(null);
  const elbowJointRef = useRef<THREE.Group>(null);
  const tcpMarkerRef = useRef<THREE.Group>(null);

  const leftFingerRef = useRef<THREE.Group>(null);
  const rightFingerRef = useRef<THREE.Group>(null);

  const l1 = ROBOT_DIMENSIONS.link1Length; // 2.2
  const l2 = ROBOT_DIMENSIONS.link2Length; // 1.8
  const baseHeight = ROBOT_DIMENSIONS.baseHeight; // 1.0

  const tempVec = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    // Interpolate or snap angles
    if (smoothMotion) {
      const lerpSpeed = Math.min(delta * 10, 1.0);
      currentAngles.current.base = THREE.MathUtils.lerp(
        currentAngles.current.base,
        targetAngles.base,
        lerpSpeed
      );
      currentAngles.current.shoulder = THREE.MathUtils.lerp(
        currentAngles.current.shoulder,
        targetAngles.shoulder,
        lerpSpeed
      );
      currentAngles.current.elbow = THREE.MathUtils.lerp(
        currentAngles.current.elbow,
        targetAngles.elbow,
        lerpSpeed
      );
    } else {
      currentAngles.current.base = targetAngles.base;
      currentAngles.current.shoulder = targetAngles.shoulder;
      currentAngles.current.elbow = targetAngles.elbow;
    }

    // Apply rotations
    // Axis 1: Base rotation around Y (yaw)
    if (baseTurretRef.current) {
      baseTurretRef.current.rotation.y = degToRad(currentAngles.current.base);
    }

    // Axis 2: Shoulder rotation (pitch)
    // Convention: 0° is upright along Y, positive tilts forward toward +X (negative rotation about Z)
    if (shoulderJointRef.current) {
      shoulderJointRef.current.rotation.z = -degToRad(currentAngles.current.shoulder);
    }

    // Axis 3: Elbow rotation (pitch)
    // Convention: 0° is in-line with segment 1, positive bends forward (negative rotation about local Z)
    if (elbowJointRef.current) {
      elbowJointRef.current.rotation.z = -degToRad(currentAngles.current.elbow);
    }

    // Animate Gripper Fingers
    const targetFingerOffset = gripperOpen ? 0.08 : 0.015;
    if (leftFingerRef.current && rightFingerRef.current) {
      leftFingerRef.current.position.x = THREE.MathUtils.lerp(
        leftFingerRef.current.position.x,
        -targetFingerOffset,
        delta * 12
      );
      rightFingerRef.current.position.x = THREE.MathUtils.lerp(
        rightFingerRef.current.position.x,
        targetFingerOffset,
        delta * 12
      );
    }

    // Update TCP World Position for telemetry and trajectory tracking
    if (tcpMarkerRef.current && onTcpUpdate) {
      tcpMarkerRef.current.getWorldPosition(tempVec.current);
      onTcpUpdate(tempVec.current);
    }
  });

  // Materials palette (Industrial aesthetics: Anthracite, Titanium, Safety Amber, Chrome)
  const matBody = (
    <meshStandardMaterial
      color="#1e293b"
      metalness={0.7}
      roughness={0.3}
    />
  );
  const matAccent = (
    <meshStandardMaterial
      color="#f59e0b"
      metalness={0.3}
      roughness={0.4}
    />
  );
  const matJoint = (
    <meshStandardMaterial
      color="#0f172a"
      metalness={0.85}
      roughness={0.2}
    />
  );
  const matChrome = (
    <meshStandardMaterial
      color="#cbd5e1"
      metalness={0.95}
      roughness={0.15}
    />
  );

  return (
    <group name="robotic-arm-root">
      {/* ============================================================== */}
      {/* 1. STATIONARY BASE ASSEMBLY (Height = baseHeight = 1.0)        */}
      {/* ============================================================== */}
      <group position={[0, 0, 0]}>
        {/* Base Pillar / Pedestal Column */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.55, 0.68, 0.7, 32]} />
          {matBody}
        </mesh>

        {/* Industrial Accent Ring on Base */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.58, 0.58, 0.06, 32]} />
          {matAccent}
        </mesh>

        {/* Stationary Turntable Collar */}
        <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.62, 0.58, 0.2, 32]} />
          {matJoint}
        </mesh>
      </group>

      {/* ============================================================== */}
      {/* 2. AXIS 1: BASE TURRET (Rotates about vertical Y axis)          */}
      {/* ============================================================== */}
      <group ref={baseTurretRef} position={[0, baseHeight, 0]}>
        {/* Swivel Turret Baseplate */}
        <mesh position={[0, -0.05, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.58, 0.6, 0.12, 32]} />
          {matJoint}
        </mesh>

        {/* Rotating Body Housing */}
        <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.48, 0.54, 0.35, 32]} />
          {matBody}
        </mesh>

        {/* Axis 1 Visual Indicator Ring (Yaw) */}
        {showIndicators && (
          <group position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.7, 0.75, 48]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.65} side={THREE.DoubleSide} />
            <Text
              position={[0.9, 0, 0]}
              fontSize={0.16}
              color="#38bdf8"
              anchorX="left"
              anchorY="middle"
            >
              Axis 1: Base (Yaw)
            </Text>
          </group>
        )}

        {/* Shoulder Fork Clevis Ears (Left and Right brackets holding Axis 2) */}
        {/* Left Clevis Plate */}
        <mesh position={[0, 0.4, 0.32]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.5, 0.14]} />
          {matBody}
        </mesh>
        {/* Right Clevis Plate */}
        <mesh position={[0, 0.4, -0.32]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.5, 0.14]} />
          {matBody}
        </mesh>

        {/* Clevis Pivot Bearing Caps (Z-axis hubs) */}
        <mesh position={[0, 0.48, 0.4]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.08, 24]} />
          {matAccent}
        </mesh>
        <mesh position={[0, 0.48, -0.4]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.08, 24]} />
          {matAccent}
        </mesh>

        {/* ============================================================== */}
        {/* 3. AXIS 2: SHOULDER JOINT & ARM SEGMENT 1 (Upper Arm)          */}
        {/* Pivot is at (0, 0.48, 0) relative to turret                    */}
        {/* ============================================================== */}
        <group ref={shoulderJointRef} position={[0, 0.48, 0]}>
          {/* Shoulder Central Hub Drum */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.52, 32]} />
            {matJoint}
          </mesh>

          {/* Axis 2 Visual Indicator (Shoulder Pitch) */}
          {showIndicators && (
            <group position={[0, 0, 0.45]}>
              <ringGeometry args={[0.36, 0.4, 32]} />
              <meshBasicMaterial color="#f43f5e" transparent opacity={0.7} side={THREE.DoubleSide} />
              <Text
                position={[0.5, 0.1, 0]}
                fontSize={0.16}
                color="#f43f5e"
                anchorX="left"
                anchorY="middle"
              >
                Axis 2: Shoulder (Pitch)
              </Text>
            </group>
          )}

          {/* Arm Segment 1: Main Structural Beam (Length = l1 = 2.2) */}
          {/* Segment body extends from Y=0 to Y=l1 */}
          <group position={[0, l1 / 2, 0]}>
            {/* Primary Arm Girder */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.26, l1 * 0.88, 0.28]} />
              {matBody}
            </mesh>

            {/* Industrial Safety Orange Highlight Spine */}
            <mesh position={[0.135, 0, 0]} castShadow>
              <boxGeometry args={[0.02, l1 * 0.75, 0.16]} />
              {matAccent}
            </mesh>

            {/* Parallel Reinforcement / Hydraulic Rod Detail */}
            <mesh position={[-0.14, 0, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, l1 * 0.8, 16]} />
              {matChrome}
            </mesh>

            {/* Status LED & Branding Stripe */}
            <mesh position={[0, 0, 0.145]}>
              <boxGeometry args={[0.12, 0.06, 0.01]} />
              <meshBasicMaterial color="#10b981" />
            </mesh>
          </group>

          {/* Upper End of Segment 1 (Elbow Joint Clevis) */}
          <mesh position={[0, l1, 0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.08, 24]} />
            {matBody}
          </mesh>
          <mesh position={[0, l1, -0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.08, 24]} />
            {matBody}
          </mesh>

          {/* ============================================================ */}
          {/* 4. AXIS 3: ELBOW JOINT & ARM SEGMENT 2 (Forearm)            */}
          {/* Pivot is at (0, l1, 0) relative to Segment 1                 */}
          {/* ============================================================ */}
          <group ref={elbowJointRef} position={[0, l1, 0]}>
            {/* Elbow Central Pivot Hub */}
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 0.34, 32]} />
              {matJoint}
            </mesh>

            {/* Elbow Axis Cap Bolts */}
            <mesh position={[0, 0, 0.18]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.14, 0.14, 0.04, 16]} />
              {matAccent}
            </mesh>
            <mesh position={[0, 0, -0.18]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.14, 0.14, 0.04, 16]} />
              {matAccent}
            </mesh>

            {/* Axis 3 Visual Indicator (Elbow Pitch) */}
            {showIndicators && (
              <group position={[0, 0, 0.28]}>
                <ringGeometry args={[0.3, 0.34, 32]} />
                <meshBasicMaterial color="#a855f7" transparent opacity={0.7} side={THREE.DoubleSide} />
                <Text
                  position={[0.42, 0.1, 0]}
                  fontSize={0.16}
                  color="#a855f7"
                  anchorX="left"
                  anchorY="middle"
                >
                  Axis 3: Elbow (Pitch)
                </Text>
              </group>
            )}

            {/* Arm Segment 2: Forearm Structural Link (Length = l2 = 1.8) */}
            <group position={[0, l2 / 2, 0]}>
              {/* Tapered Forearm Beam */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[0.2, l2 * 0.88, 0.22]} />
                {matBody}
              </mesh>

              {/* Accent Striping on Forearm */}
              <mesh position={[0.105, 0, 0]} castShadow>
                <boxGeometry args={[0.02, l2 * 0.7, 0.12]} />
                {matAccent}
              </mesh>

              {/* Pneumatic Line Conduit Tube */}
              <mesh position={[-0.11, 0, 0]} castShadow>
                <cylinderGeometry args={[0.025, 0.025, l2 * 0.8, 12]} />
                {matChrome}
              </mesh>
            </group>

            {/* ========================================================== */}
            {/* 5. END-EFFECTOR (Gripper Assembly at Tip of Segment 2)     */}
            {/* Mounted at position (0, l2, 0) relative to elbow           */}
            {/* ========================================================== */}
            <group position={[0, l2, 0]}>
              {/* Wrist Mounting Flange */}
              <mesh position={[0, 0.04, 0]} castShadow>
                <cylinderGeometry args={[0.14, 0.15, 0.08, 24]} />
                {matJoint}
              </mesh>

              {/* Gripper Actuator Body */}
              <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.24, 0.16, 0.16]} />
                {matAccent}
              </mesh>

              {/* Gripper Tool Faceplate */}
              <mesh position={[0, 0.25, 0]} castShadow>
                <boxGeometry args={[0.28, 0.04, 0.14]} />
                {matBody}
              </mesh>

              {/* Left Gripper Finger */}
              <group ref={leftFingerRef} position={[-0.08, 0.27, 0]}>
                {/* Finger base */}
                <mesh position={[0, 0.1, 0]} castShadow>
                  <boxGeometry args={[0.035, 0.18, 0.07]} />
                  {matChrome}
                </mesh>
                {/* Rubber grip pad (inward facing) */}
                <mesh position={[0.018, 0.11, 0]}>
                  <boxGeometry args={[0.008, 0.12, 0.06]} />
                  <meshStandardMaterial color="#0f172a" roughness={0.9} />
                </mesh>
              </group>

              {/* Right Gripper Finger */}
              <group ref={rightFingerRef} position={[0.08, 0.27, 0]}>
                {/* Finger base */}
                <mesh position={[0, 0.1, 0]} castShadow>
                  <boxGeometry args={[0.035, 0.18, 0.07]} />
                  {matChrome}
                </mesh>
                {/* Rubber grip pad (inward facing) */}
                <mesh position={[-0.018, 0.11, 0]}>
                  <boxGeometry args={[0.008, 0.12, 0.06]} />
                  <meshStandardMaterial color="#0f172a" roughness={0.9} />
                </mesh>
              </group>

              {/* Tool Center Point (TCP) Ref Marker at tip */}
              <group ref={tcpMarkerRef} position={[0, 0.42, 0]}>
                {/* Glowing TCP bead */}
                <mesh>
                  <sphereGeometry args={[0.035, 16, 16]} />
                  <meshBasicMaterial color="#10b981" />
                </mesh>

                {/* Local Mini-Axes Triad at TCP */}
                {showIndicators && (
                  <group>
                    {/* TCP +X (Red) */}
                    <mesh position={[0.1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                      <cylinderGeometry args={[0.008, 0.008, 0.2, 8]} />
                      <meshBasicMaterial color="#ef4444" />
                    </mesh>
                    {/* TCP +Y (Green, tool pointing vector) */}
                    <mesh position={[0, 0.1, 0]}>
                      <cylinderGeometry args={[0.008, 0.008, 0.2, 8]} />
                      <meshBasicMaterial color="#10b981" />
                    </mesh>
                    {/* TCP +Z (Blue) */}
                    <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
                      <cylinderGeometry args={[0.008, 0.008, 0.2, 8]} />
                      <meshBasicMaterial color="#3b82f6" />
                    </mesh>
                    <Text
                      position={[0, 0.25, 0]}
                      fontSize={0.13}
                      color="#10b981"
                      anchorX="center"
                      anchorY="bottom"
                    >
                      TCP
                    </Text>
                  </group>
                )}
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
