import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const VEG_MODELS = [
  'bush1', 'bush2', 'bush3', 
  'flower1', 'flower2', 
  'flower_bush_blue', 'flower_bush_red'
];

function GrowingModel({ modelPath, position, rotation, scale, scrollProgress, index }) {
  const ref = useRef();
  const { scene } = useGLTF(modelPath);
  const clone = useMemo(() => scene.clone(), [scene]);

  useFrame(() => {
    if (!ref.current) return;
    
    // Staggered growth starting at 96%
    const startThreshold = 0.96 + (index * 0.0005); 
    let growth = 0;
    
    if (scrollProgress > startThreshold) {
        const progress = (scrollProgress - startThreshold) / (1 - startThreshold);
        const val = THREE.MathUtils.clamp(progress, 0, 1);
        // Elastic "pop" effect
        growth = val === 0 ? 0 : Math.pow(2, -10 * val) * Math.sin((val * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
    }
    
    const currentScale = ref.current.scale.x;
    const targetScaleVal = growth * scale;
    const smoothScale = THREE.MathUtils.lerp(currentScale, targetScaleVal, 0.1);
    
    ref.current.scale.set(smoothScale, smoothScale, smoothScale);
  });

  return (
    <primitive 
      ref={ref}
      object={clone}
      position={position}
      rotation={rotation}
      scale={[0, 0, 0]} 
    />
  );
}

export function FinalScene({ scrollProgress }) {
  const { items } = useMemo(() => {
    const allItems = [];
    
    // CENTER: x:20, z:0 (Character stop point)
    // ANGLE: 45 degrees (Character facing direction)
    const center = { x: 20, z: 0 }; 
    const baseAngle = Math.PI / 4; 
    const fanSpread = Math.PI / 1.5; // 120 degrees wide
    
    // 1. Generate Trees (40 items)
    for (let i = 0; i < 40; i++) {
      const angle = baseAngle + (Math.random() - 0.5) * fanSpread;
      const distance = 4 + Math.random() * 21;
      const x = center.x + Math.cos(angle) * distance;
      const z = center.z + Math.sin(angle) * distance;
      
      const scale = 0.4 + Math.random() * 0.4;
      const treeType = Math.floor(Math.random() * 6) + 1;
      
      allItems.push({
        model: `/models/tree${treeType}.glb`,
        position: [x, 0, z],
        rotation: [0, Math.random() * Math.PI * 2, 0],
        scale: scale
      });
    }

    // 2. Generate Bushes/Flowers (50 items)
    for (let i = 0; i < 50; i++) {
      const angle = baseAngle + (Math.random() - 0.5) * fanSpread;
      const distance = 3 + Math.random() * 20; 
      const x = center.x + Math.cos(angle) * distance;
      const z = center.z + Math.sin(angle) * distance;
      
      const vegName = VEG_MODELS[Math.floor(Math.random() * VEG_MODELS.length)];
      
      allItems.push({
        model: `/models/${vegName}.glb`,
        position: [x, 0.2, z], 
        rotation: [0, Math.random() * Math.PI * 2, 0],
        scale: 0.8 + Math.random() * 0.5 
      });
    }

    return { items: allItems };
  }, []);

  return (
    <group>
      {items.map((data, i) => (
        <GrowingModel 
            key={i} 
            modelPath={data.model}
            position={data.position}
            rotation={data.rotation}
            scale={data.scale}
            scrollProgress={scrollProgress} 
            index={i}
        />
      ))}
    </group>
  );
}