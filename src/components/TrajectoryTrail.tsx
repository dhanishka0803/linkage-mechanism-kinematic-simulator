import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface TrajectoryTrailProps {
  currentTcpPosition: THREE.Vector3 | null;
  enabled: boolean;
  maxPoints?: number;
}

export function TrajectoryTrail({
  currentTcpPosition,
  enabled,
  maxPoints = 200,
}: TrajectoryTrailProps) {
  const lineRef = useRef<THREE.Line>(null);
  const pointsRef = useRef<THREE.Vector3[]>([]);
  const lastRecordedPos = useRef<THREE.Vector3>(new THREE.Vector3(-999, -999, -999));

  useEffect(() => {
    if (!enabled) {
      pointsRef.current = [];
      if (lineRef.current) {
        lineRef.current.geometry.setFromPoints([]);
      }
    }
  }, [enabled]);

  useFrame(() => {
    if (!enabled || !currentTcpPosition || !lineRef.current) return;

    // Only add a new point if the TCP has moved significantly (> 0.03m)
    if (currentTcpPosition.distanceTo(lastRecordedPos.current) > 0.03) {
      lastRecordedPos.current.copy(currentTcpPosition);
      pointsRef.current.push(currentTcpPosition.clone());

      if (pointsRef.current.length > maxPoints) {
        pointsRef.current.shift();
      }

      lineRef.current.geometry.setFromPoints(pointsRef.current);
    }
  });

  if (!enabled) return null;

  return (
    <primitive
      object={
        new THREE.Line(
          new THREE.BufferGeometry(),
          new THREE.LineBasicMaterial({
            color: 0x10b981,
            linewidth: 2,
            transparent: true,
            opacity: 0.85,
          })
        )
      }
      ref={lineRef}
    />
  );
}
