import React, { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';

const SECTION_TEXTS = {
  2: { title: "About Me", subsections: ["My Story", "Philosophy", "Background"] },
  4: { title: "Skills", subsections: ["React", "Three.js", "Node"] },
  6: { title: "Projects", subsections: ["Mobile", "Web", "Game Dev"] },
  8: { title: "Contact", subsections: ["Email", "LinkedIn", "Twitter"] },
};

const SECTION_ID_MAP = {
  2: 'about', 4: 'skills', 6: 'projects', 8: 'contact'
};

const VEG_MODELS = [
  'bush1', 'bush2', 'bush3', 
  'flower1', 'flower2', 
  'flower_bush_blue', 'flower_bush_red'
];

const SectionCubesData = [
  { id: 1, position: [0.5, 0, 3.5], targetProgress: 0.1 },
  { id: 2, position: [6.5, 0, 6.5], targetProgress: 0.2 },
  { id: 3, position: [5.5, 0, 1.5], targetProgress: 0.3 },
  { id: 4, position: [11.5, 0, 1.5], targetProgress: 0.4 },
  { id: 5, position: [10.5, 0, -4.5], targetProgress: 0.5 },
  { id: 6, position: [14.5, 0, -1.5], targetProgress: 0.6 },
  { id: 7, position: [13.5, 0, -7.5], targetProgress: 0.7 },
  { id: 8, position: [18.5, 0, -4.5], targetProgress: 0.8 },
  { id: 9, position: [18.0, 0, 1.0], targetProgress: 0.9 },
];

function VegetationItem({ modelName, position, rotation, isOpen, label, onCubeClick, id, scrollFactor }) {
  const path = `/models/${modelName}.glb`;
  const { scene } = useGLTF(path);
  const clone = useMemo(() => scene.clone(), [scene]);
  const ref = useRef();

  useFrame(() => {
    if (!ref.current) return;
    
    const vegBaseScale = 0.8; 
    const targetScale = scrollFactor * vegBaseScale; 
    
    ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  return (
    <group position={position} rotation={rotation}>
        <primitive 
            ref={ref}
            object={clone} 
            scale={[0.001, 0.001, 0.001]}
            onClick={(e) => {
                e.stopPropagation();
                if (isOpen && label) onCubeClick(id); 
            }}
        />

        {isOpen && label && (
            <Html position={[0, 1.5, 0]} center distanceFactor={30} zIndexRange={[100, 0]}>
            <div className="px-2 py-0.5 bg-white/90 text-black text-[10px] font-bold rounded shadow-md cursor-pointer hover:bg-white hover:scale-110 transition-transform whitespace-nowrap tracking-tight">
                {label}
            </div>
            </Html>
        )}
    </group>
  );
}

function TreeWithFauna({ id, modelPath, position, targetProgress, scrollProgress, onCubeClick, onSectionSelect }) {
  const treeRef = useRef();
  const titleRef = useRef(); 
  const [isOpen, setIsOpen] = useState(false); 
  const { size } = useThree();
  const isMobile = size.width < 768;

  const { scene } = useGLTF(modelPath);
  const clone = useMemo(() => scene.clone(), [scene]);
  const config = SECTION_TEXTS[id];

  const startProgress = targetProgress - 0.1;
  const endProgress = targetProgress;
  const activeProgress = THREE.MathUtils.clamp((scrollProgress - startProgress) / (endProgress - startProgress), 0, 1);
  const easeProgress = (val) => val < 0.5 ? 2 * val * val : 1 - Math.pow(-2 * val + 2, 2) / 2;
  const scrollFactor = easeProgress(activeProgress);

  const faunaData = useMemo(() => {
    const minCount = config ? config.subsections.length : 3;
    const count = minCount + Math.floor(Math.random() * 2); 
    const items = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2; 
      
      // CHANGED: Increased the radius spread
      const radius = 2.5 + Math.random() * 1.0; 
      
      const vegName = VEG_MODELS[Math.floor(Math.random() * VEG_MODELS.length)];

      items.push({
        // CHANGED: Added random jitter (+/- 0.5 units) to push the vegetation further off-center
        x: (Math.cos(angle) * radius) + (Math.random() - 0.5) * 1.0, 
        z: (Math.sin(angle) * radius) + (Math.random() - 0.5) * 1.0, 
        rotation: [0, Math.random() * Math.PI, 0],
        modelName: vegName
      });
    }
    return items;
  }, [config]);

  useFrame(() => {
    if (treeRef.current) {
        const baseScale = isMobile ? 0.6 : 1.1; 
        const treeScale = 0.01 + scrollFactor * baseScale;
        treeRef.current.scale.set(treeScale, treeScale, treeScale);
    }
    if (titleRef.current) {
        titleRef.current.style.opacity = scrollFactor;
        titleRef.current.style.transform = `scale(${scrollFactor})`;
    }
  });

  const handleTitleClick = (e) => {
    e.stopPropagation();
    const sectionKey = SECTION_ID_MAP[id];
    if (sectionKey && onSectionSelect) {
      onSectionSelect(sectionKey);
    }
  };

  return (
    <group position={position}>
      {/* MAIN TREE */}
      <group onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}>
        <primitive ref={treeRef} object={clone} dispose={null} scale={[0.01, 0.01, 0.01]} />
        {config && (
          <Html position={[0, 2.5, 0]} center distanceFactor={40} style={{ pointerEvents: 'none' }}>
            <div 
              ref={titleRef} 
              onClick={handleTitleClick}
              className={`
                text-white font-bold text-sm tracking-wide drop-shadow-lg whitespace-nowrap select-none
                ${isOpen ? 'text-red-400' : 'text-white'}
                cursor-pointer hover:underline hover:text-red-300 pointer-events-auto
                transition-all duration-300
              `}
              style={{ opacity: 0, transform: 'scale(0)' }} 
            >
              {config.title} <span className="text-xs opacity-70 ml-1">↗</span>
            </div>
          </Html>
        )}
      </group>
      
      {/* SURROUNDING VEGETATION */}
      {faunaData.map((data, index) => {
        const label = config?.subsections[index];
        return (
            <VegetationItem 
                key={index}
                modelName={data.modelName}
                position={[data.x, 0, data.z]} 
                rotation={data.rotation}
                isOpen={isOpen}
                label={label}
                onCubeClick={onCubeClick}
                id={id}
                scrollFactor={scrollFactor}
            />
        );
      })}
    </group>
  );
}

export function SectionCubes({ scrollProgress, onCubeClick, onSectionSelect }) {
  return (
    <>
      {SectionCubesData.map((data, index) => {
        const treeIndex = (index % 6) + 1; 
        const path = `/models/tree${treeIndex}.glb`;
        return (
          <TreeWithFauna
            key={data.id}
            id={data.id}
            modelPath={path}
            position={data.position}
            targetProgress={data.targetProgress}
            scrollProgress={scrollProgress}
            onCubeClick={onCubeClick}
            onSectionSelect={onSectionSelect}
          />
        );
      })}
    </>
  );
}

useGLTF.preload('/models/tree1.glb');
useGLTF.preload('/models/tree2.glb');