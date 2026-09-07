import { useRef } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface AxesAndGridProps {
  showGrid: boolean;
  showAxes: boolean;
}

export function AxesAndGrid({ showGrid, showAxes }: AxesAndGridProps) {
  const axesLength = 4.5;
  const arrowRadius = 0.06;
  const headLength = 0.25;
  const headWidth = 0.12;

  return (
    <group name="axes-and-grid-group">
      {/* 3D Ground Coordinate Grid */}
      {showGrid && (
        <group position={[0, -0.001, 0]}>
          <gridHelper
            args={[14, 28, '#475569', '#1e293b']}
            position={[0, 0, 0]}
          />
          {/* Subtle concentric work envelope circles */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <ringGeometry args={[2.0, 2.015, 64]} />
            <meshBasicMaterial color="#334155" transparent opacity={0.6} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <ringGeometry args={[4.0, 4.015, 64]} />
            <meshBasicMaterial color="#334155" transparent opacity={0.4} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <ringGeometry args={[4.7, 4.72, 64]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.35} />
          </mesh>
          {/* Maximum reach limit label */}
          <Text
            position={[4.9, 0.05, 0]}
            rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
            fontSize={0.2}
            color="#f59e0b"
            anchorX="center"
            anchorY="middle"
          >
            MAX REACH (4.7m)
          </Text>
        </group>
      )}

      {/* 3D Coordinate Reference Axes */}
      {showAxes && (
        <group position={[0, 0.01, 0]}>
          {/* X Axis (+X: Red) */}
          <group>
            {/* Shaft */}
            <mesh position={[axesLength / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <cylinderGeometry args={[arrowRadius, arrowRadius, axesLength, 16]} />
              <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.2} />
            </mesh>
            {/* Cone Tip */}
            <mesh position={[axesLength + headLength / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <coneGeometry args={[headWidth, headLength, 16]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
            {/* Axis Label */}
            <Text
              position={[axesLength + 0.5, 0.15, 0]}
              fontSize={0.28}
              color="#ef4444"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#000000"
            >
              +X (Forward)
            </Text>
          </group>

          {/* Y Axis (+Y: Green, Vertical) */}
          <group>
            {/* Shaft */}
            <mesh position={[0, axesLength / 2, 0]}>
              <cylinderGeometry args={[arrowRadius, arrowRadius, axesLength, 16]} />
              <meshStandardMaterial color="#10b981" roughness={0.3} metalness={0.2} />
            </mesh>
            {/* Cone Tip */}
            <mesh position={[0, axesLength + headLength / 2, 0]}>
              <coneGeometry args={[headWidth, headLength, 16]} />
              <meshStandardMaterial color="#10b981" />
            </mesh>
            {/* Axis Label */}
            <Text
              position={[0, axesLength + 0.5, 0]}
              fontSize={0.28}
              color="#10b981"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#000000"
            >
              +Y (Up)
            </Text>
          </group>

          {/* Z Axis (+Z: Blue, Lateral / Depth) */}
          <group>
            {/* Shaft */}
            <mesh position={[0, 0, axesLength / 2]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[arrowRadius, arrowRadius, axesLength, 16]} />
              <meshStandardMaterial color="#3b82f6" roughness={0.3} metalness={0.2} />
            </mesh>
            {/* Cone Tip */}
            <mesh position={[0, 0, axesLength + headLength / 2]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[headWidth, headLength, 16]} />
              <meshStandardMaterial color="#3b82f6" />
            </mesh>
            {/* Axis Label */}
            <Text
              position={[0, 0.15, axesLength + 0.5]}
              fontSize={0.28}
              color="#3b82f6"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#000000"
            >
              +Z (Depth)
            </Text>
          </group>

          {/* Origin Marker */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#ffffff" metalness={0.6} roughness={0.2} />
          </mesh>
          <Text
            position={[-0.25, 0.2, -0.25]}
            fontSize={0.2}
            color="#94a3b8"
            anchorX="center"
            anchorY="middle"
          >
            (0,0,0)
          </Text>
        </group>
      )}

      {/* Robot Base Mount Platform */}
      <group position={[0, 0, 0]}>
        {/* Foundation steel plate */}
        <mesh position={[0, 0.03, 0]} receiveShadow>
          <cylinderGeometry args={[1.0, 1.05, 0.06, 32]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Turntable beveled ring */}
        <mesh position={[0, 0.08, 0]} receiveShadow>
          <cylinderGeometry args={[0.82, 0.9, 0.05, 32]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Yellow caution perimeter rim */}
        <mesh position={[0, 0.01, 0]}>
          <ringGeometry args={[0.98, 1.03, 32]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
        {/* Mounting bolts */}
        {[0, 60, 120, 180, 240, 300].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const dist = 0.88;
          return (
            <mesh
              key={deg}
              position={[Math.cos(rad) * dist, 0.07, Math.sin(rad) * dist]}
              castShadow
            >
              <cylinderGeometry args={[0.035, 0.035, 0.04, 8]} />
              <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
