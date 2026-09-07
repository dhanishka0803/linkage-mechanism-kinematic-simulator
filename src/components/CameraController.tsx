import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { CameraViewPreset } from '../types';

interface CameraControllerProps {
  viewPreset: CameraViewPreset;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

export function CameraController({ viewPreset, controlsRef }: CameraControllerProps) {
  const { camera } = useThree();
  const targetCamPos = useRef(new THREE.Vector3(5.5, 4.0, 5.5));
  const targetLookAt = useRef(new THREE.Vector3(0, 1.8, 0));
  const isTransitioning = useRef(false);

  useEffect(() => {
    switch (viewPreset) {
      case 'iso':
        targetCamPos.current.set(5.5, 4.2, 5.5);
        targetLookAt.current.set(0, 1.8, 0);
        break;
      case 'top':
        targetCamPos.current.set(0.01, 8.5, 0.01);
        targetLookAt.current.set(0, 0, 0);
        break;
      case 'front':
        targetCamPos.current.set(7.5, 2.2, 0.01);
        targetLookAt.current.set(0, 2.0, 0);
        break;
      case 'side':
        targetCamPos.current.set(0.01, 2.2, 7.5);
        targetLookAt.current.set(0, 2.0, 0);
        break;
    }
    isTransitioning.current = true;
  }, [viewPreset]);

  useFrame((_, delta) => {
    if (!isTransitioning.current) return;

    camera.position.lerp(targetCamPos.current, delta * 6);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, delta * 6);
      controlsRef.current.update();
    }

    if (camera.position.distanceTo(targetCamPos.current) < 0.05) {
      camera.position.copy(targetCamPos.current);
      if (controlsRef.current) {
        controlsRef.current.target.copy(targetLookAt.current);
        controlsRef.current.update();
      }
      isTransitioning.current = false;
    }
  });

  return null;
}
