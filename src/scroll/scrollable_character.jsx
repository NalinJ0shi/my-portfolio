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
      if (isActivelyScrolling || scrollProgress > 0) {
        
        // --- A. Define Standard "Chase" Offset (No Rotation) ---
        // This places the camera 5 units right, 5 units up, 5 units back relative to the character
        // You can tweak these numbers to change the fixed angle.
        const chaseOffset = new THREE.Vector3(5, 5, 5); 
        
        // Calculate where the camera should be based on character position
        const targetCameraPosition = new THREE.Vector3()
          .copy(group.current.position)
          .add(chaseOffset);

        // --- B. Intro Blend (0% to 10%) ---
        // Smoothly transition from the specific "Intro" coordinates to our "Chase" coordinates
        const initialCameraPosition = new THREE.Vector3(5, 8, 10); // Your starting position
        const blendFactor = THREE.MathUtils.clamp(scrollProgress / 0.1, 0, 1); // 0 to 1 over first 10%

        const finalPosition = new THREE.Vector3().lerpVectors(initialCameraPosition, targetCameraPosition, blendFactor);
        
        // Apply Position
        cameraRef.current.position.lerp(finalPosition, 0.1);
        cameraRef.current.lookAt(group.current.position);

        // --- C. Dynamic FOV (Starts increasing after 10%) ---
        const baseFov = 50;
        const maxFov = 75; // Target FOV to see more environment
        
        let targetFov = baseFov;
        if (scrollProgress > 0.1) {
           // Normalize progress from 0.1 to 1.0 -> 0 to 1
           const fovProgress = (scrollProgress - 0.1) / 0.9; 
           targetFov = THREE.MathUtils.lerp(baseFov, maxFov, fovProgress);
        }

        cameraRef.current.fov = THREE.MathUtils.lerp(cameraRef.current.fov, targetFov, 0.05);
        cameraRef.current.updateProjectionMatrix();
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