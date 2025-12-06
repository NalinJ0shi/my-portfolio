import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber'; // 🚀 ADDED useThree
import { useGLTF, useAnimations, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { transitionAnimation } from '../scroll';

export function ScrollableScene({ 
  modelUrl = '/models/man.glb', 
  scrollProgress = 0, 
  isActivelyScrolling = false,
  onCameraRef = null 
}) {
  const group = useRef();
  const { scene, animations } = useGLTF(modelUrl);
  const { actions } = useAnimations(animations, group);
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const cameraRef = useRef();
  const pathRef = useRef();
  
  // 🚀 ADDED: Mobile check
  const { size } = useThree();
  const isMobile = size.width < 768; 
  
  // Pass camera ref to parent component
  useEffect(() => {
    if (onCameraRef && cameraRef.current) {
      onCameraRef(cameraRef);
    }
  }, [onCameraRef, cameraRef.current]);
  
  // --- 🔧 THE INVISIBLE MAN FIX ---
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.frustumCulled = false;
        if (child.material) {
          child.material.transparent = false;
          child.material.opacity = 1;
          child.material.depthWrite = true;
          child.material.side = THREE.FrontSide;
          child.material.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  // Preload
  useEffect(() => {
    useGLTF.preload(modelUrl);
  }, [modelUrl]);
  
  // Path
  useEffect(() => {
    pathRef.current = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(5, 0, 5),
      new THREE.Vector3(10, 0, 0),
      new THREE.Vector3(15, 0, -5),
      new THREE.Vector3(20, 0, 0),
    ]);
  }, []);

  // --- ANIMATION LOGIC ---
  useEffect(() => {
    if (!actions || animations.length < 2) return;
    const idleAnim = 'idle';
    const walkAnim = 'walk';
    const waveAnim = 'wave';
    let nextAnim = idleAnim;

    if (scrollProgress < 0.05) {
      nextAnim = waveAnim;
    } else if (isActivelyScrolling) {
      nextAnim = walkAnim;
    } else {
      nextAnim = idleAnim;
    }

    if (currentAnimation !== nextAnim) {
      if (actions[nextAnim]) {
        transitionAnimation(actions, currentAnimation, nextAnim, 0.2);
        setCurrentAnimation(nextAnim);
      } else {
        if (nextAnim === waveAnim && currentAnimation !== idleAnim) {
            transitionAnimation(actions, currentAnimation, idleAnim, 0.2);
            setCurrentAnimation(idleAnim);
        }
      }
    }
  }, [actions, animations, scrollProgress, currentAnimation, isActivelyScrolling]);

  // Initial setup
  useEffect(() => {
    if (actions && animations.length > 0) {
      const startAnim = actions['wave'] ? 'wave' : 'idle';
      if (actions[startAnim]) {
          actions[startAnim].reset().play();
          setCurrentAnimation(startAnim);
      }
    }
  }, [actions, animations]);

  // Camera & Character Movement
  useFrame(() => {
    if (!group.current || !pathRef.current || !cameraRef.current) return;

    if (scrollProgress > 0) {
      // 1. CHARACTER MOVEMENT
      const position = pathRef.current.getPoint(scrollProgress);
      group.current.position.set(position.x, position.y, position.z);

      if (scrollProgress > 0.01) {
        const lookAtPoint = pathRef.current.getPoint(Math.min(scrollProgress + 0.01, 1));
        const direction = new THREE.Vector3().subVectors(lookAtPoint, position).normalize();
        if (direction.length() > 0) {
          const lookAtTarget = new THREE.Vector3().addVectors(position, direction);
          group.current.lookAt(lookAtTarget);
        }
      }

      // 2. CAMERA LOGIC
      if (isActivelyScrolling) {
        // --- A. The "Follow" Target Settings (Used after 20%) ---
        // 🚀 CHANGED: Use 14 for mobile, 7 for laptop
        const cameraDistance = isMobile ? 14 : 7;
        
        const rawHeight = 4.0 + scrollProgress * 2;
        const targetY = Math.max(5.0, group.current.position.y + rawHeight);

        const revolutionAngle = Math.PI - (scrollProgress * 2 * Math.PI);
        
        const targetCameraPosition = new THREE.Vector3(
          group.current.position.x + Math.cos(revolutionAngle) * cameraDistance,
          targetY, 
          group.current.position.z + Math.sin(revolutionAngle) * cameraDistance
        );
        
        // --- B. The "Intro" Start Settings (Used before 10%) ---
        const initialCameraPosition = new THREE.Vector3(5, 8, 10);
        
        // --- C. The Blend (Transition from 10% to 20%) ---
        const blendStart = 0.10;
        const blendEnd = 0.20;
        const blendFactor = THREE.MathUtils.clamp(
          (scrollProgress - blendStart) / (blendEnd - blendStart), 
          0, 
          1
        );

        // Mix the positions
        const mixedTarget = new THREE.Vector3().lerpVectors(initialCameraPosition, targetCameraPosition, blendFactor);
        
        // Apply position
        cameraRef.current.position.lerp(mixedTarget, 0.01);
        cameraRef.current.lookAt(group.current.position);
      }
    }
  });

  return (
    <>
      <PerspectiveCamera 
        ref={cameraRef}
        makeDefault
        position={[5, 8, 10]}
        fov={50}
      />
      <primitive ref={group} object={scene} scale={1} />
    </>
  );
}