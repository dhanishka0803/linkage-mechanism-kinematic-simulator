import { useRef, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { JointAngles, ViewOptions, CameraViewPreset } from '../types';
import { AxesAndGrid } from './AxesAndGrid';
import { RoboticArmMesh } from './RoboticArmMesh';
import { TrajectoryTrail } from './TrajectoryTrail';
import { CameraController } from './CameraController';

interface RoboticArmSceneProps {
  targetAngles: JointAngles;
  currentAngles: React.MutableRefObject<JointAngles>;
  gripperOpen: boolean;
  viewOptions: ViewOptions;
  cameraPreset: CameraViewPreset;
  onTcpPositionChange?: (pos: THREE.Vector3) => void;
}

export function RoboticArmScene({
  targetAngles,
  currentAngles,
  gripperOpen,
  viewOptions,
  cameraPreset,
  onTcpPositionChange,
}: RoboticArmSceneProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [currentTcp, setCurrentTcp] = useState<THREE.Vector3 | null>(null);

  const handleTcpUpdate = useCallback(
    (pos: THREE.Vector3) => {
      setCurrentTcp(pos);
      if (onTcpPositionChange) {
        onTcpPositionChange(pos);
      }
    },
    [onTcpPositionChange]
  );

  return (
    <div className="relative w-full h-full select-none bg-slate-900 overflow-hidden">
      {/* Sleek Interface radial dot grid overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <Canvas
        shadows
        camera={{ position: [5.5, 4.2, 5.5], fov: 48 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        {/* Sleek slate ambient background color */}
        <color attach="background" args={['#0f172a']} />
        <fog attach="fog" args={['#0f172a', 10, 28]} />

        {/* Studio Lighting Setup */}
        <ambientLight intensity={0.7} />
        
        {/* Main Sun / Key Light with crisp soft shadows */}
        <directionalLight
          position={[6, 10, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={25}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
          shadow-bias={-0.0003}
        />

        {/* Back / Rim Light for specular highlights on arm edges */}
        <directionalLight position={[-6, 6, -5]} intensity={0.9} color="#93c5fd" />

        {/* Warm fill light from front-low */}
        <pointLight position={[3, 2, -3]} intensity={0.5} color="#fed7aa" />

        {/* Orbit Camera Controls */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={1.8}
          maxDistance={18}
          maxPolarAngle={Math.PI / 2 - 0.02} // Prevent camera going below ground
          target={[0, 1.8, 0]}
        />

        {/* Camera viewpoint animated switcher */}
        <CameraController viewPreset={cameraPreset} controlsRef={controlsRef} />

        {/* Ground shadow receiver mesh */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.005, 0]}
          receiveShadow
        >
          <planeGeometry args={[30, 30]} />
          <shadowMaterial opacity={0.45} />
        </mesh>

        {/* 3D Coordinate Grid and Origin Axes */}
        <AxesAndGrid
          showGrid={viewOptions.showGrid}
          showAxes={viewOptions.showAxes}
        />

        {/* Trajectory trail behind Tool Center Point */}
        <TrajectoryTrail
          currentTcpPosition={currentTcp}
          enabled={viewOptions.showTrajectory}
        />

        {/* 3-Axis Robotic Arm Hierarchical 3D Model */}
        <RoboticArmMesh
          targetAngles={targetAngles}
          currentAngles={currentAngles}
          gripperOpen={gripperOpen}
          showIndicators={viewOptions.showJointIndicators}
          smoothMotion={viewOptions.smoothMotion}
          onTcpUpdate={handleTcpUpdate}
        />
      </Canvas>
    </div>
  );
}
