import React, { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber'; // 🚀 ADDED useThree
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';

// -----------------------------------------------------------------
// 📝 CONFIGURATION
// -----------------------------------------------------------------
const SECTION_TEXTS = {
  // ABOUT SECTION
  2: { title: "About Me", subsections: ["My Story", "Philosophy", "Background"] },
  3: { title: "My Vision", subsections: ["Future", "Goals", "Creativity"] },

  // SKILLS SECTION
  4: { title: "Tech Stack", subsections: ["React", "Three.js", "Node"] },
  5: { title: "Design", subsections: ["Blender", "Figma", "UI/UX"] },

  // PROJECTS SECTION
  6: { title: "Projects", subsections: ["Mobile", "Web", "Game Dev"] },
  7: { title: "Recent", subsections: ["The Last Gate", "Portfolio", "Demos"] },

  // CONTACT SECTION
  8: { title: "Contact", subsections: ["Email", "LinkedIn", "Twitter"] },
  9: { title: "Socials", subsections: ["GitHub", "Instagram", "Discord"] },
};

// -----------------------------------------------------------------
// 📍 POSITIONS
// -----------------------------------------------------------------
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

function TreeWithFauna({ id, modelPath, position, targetProgress, scrollProgress, onCubeClick }) {
  const treeRef = useRef();
  const faunaRefs = useRef([]);
  const titleRef = useRef(); 
  const [isOpen, setIsOpen] = useState(false); 
  const [hovered, setHovered] = useState(false);

  // 🚀 ADDED: Mobile checkd
  const { size } = useThree();
  const isMobile = size.width < 768;

  const { scene } = useGLTF(modelPath);
  const clone = useMemo(() => scene.clone(), [scene]);
  const config = SECTION_TEXTS[id];

  const faunaData = useMemo(() => {
    const minCount = config ? config.subsections.length : 3;
    const count = minCount + Math.floor(Math.random() * 2); 
    const items = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2; 
      const radius = 1.2 + Math.random() * 0.5;
      items.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        size: 0.25 + Math.random() * 0.2, 
        rotation: [0, Math.random() * Math.PI, 0]
      });
    }
    return items;
  }, [config]);

  useFrame(() => {
    const startProgress = targetProgress - 0.1;
    const endProgress = targetProgress;
    const activeProgress = THREE.MathUtils.clamp((scrollProgress - startProgress) / (endProgress - startProgress), 0, 1);
    const easeProgress = (val) => val < 0.5 ? 2 * val * val : 1 - Math.pow(-2 * val + 2, 2) / 2;
    
    // Calculated Growth Value (0 to 1)
    const val = easeProgress(activeProgress);
    
    // 1. Animate Tree Size
    if (treeRef.current) {
        // 🚀 CHANGED: Max scale based on mobile or laptop
        const baseScale = isMobile ? 0.8 : 1.5; 
        const treeScale = 0.01 + val * baseScale;
        
        treeRef.current.scale.set(treeScale, treeScale, treeScale);
    }

    // 2. Animate Title Text (Grow & Fade In with Tree)
    if (titleRef.current) {
        titleRef.current.style.opacity = val;
        titleRef.current.style.transform = `scale(${val})`;
    }

    // 3. Animate Fauna (Small cubes)
    faunaRefs.current.forEach((mesh, i) => {
        if (mesh) {
            const data = faunaData[i];
            const targetSize = isOpen ? data.size * 1.5 : data.size;
            const currentScale = val * targetSize; 
            mesh.scale.lerp(new THREE.Vector3(currentScale, currentScale, currentScale), 0.1);
        }
    });
  });

  return (
    <group position={position}>
      {/* --- THE MAIN TREE --- */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <primitive 
          ref={treeRef} 
          object={clone} 
          dispose={null} 
          scale={[0.01, 0.01, 0.01]} 
        />
        
        {/* Floating Title Label */}
        {config && (
          <Html position={[0, 2.5, 0]} center distanceFactor={40} style={{ pointerEvents: 'none' }}>
            <div 
              ref={titleRef} 
              className={`
                text-white font-bold text-sm tracking-wide drop-shadow-lg whitespace-nowrap select-none
                ${isOpen ? 'text-red-400' : 'text-white'}
                transition-colors duration-300
              `}
              style={{ opacity: 0, transform: 'scale(0)' }} 
            >
              {config.title}
            </div>
          </Html>
        )}
      </group>
      
      {/* --- THE FAUNA (SUBSECTIONS) --- */}
      {faunaData.map((data, index) => {
        const label = config?.subsections[index];
        return (
          <mesh 
            key={index}
            ref={el => faunaRefs.current[index] = el}
            position={[data.x, 0.2, data.z]} 
            rotation={data.rotation}
            castShadow
            scale={[0, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              if (isOpen && label) onCubeClick(id); 
            }}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial 
              color={isOpen && label ? "#ef4444" : "#4ade80"} 
              roughness={0.8} 
            />
            
            {/* Subsection Label */}
            {isOpen && label && (
              <Html position={[0, 1.2, 0]} center distanceFactor={30} zIndexRange={[100, 0]}>
                <div 
                  className="px-2 py-0.5 bg-white/90 text-black text-[10px] font-bold rounded shadow-md cursor-pointer hover:bg-white hover:scale-110 transition-transform whitespace-nowrap tracking-tight"
                >
                  {label}
                </div>
              </Html>
            )}
          </mesh>
        );
      })}
    </group>
  );
}

export function SectionCubes({ scrollProgress, onCubeClick }) {
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
          />
        );
      })}
    </>
  );
}

useGLTF.preload('/models/tree1.glb');
useGLTF.preload('/models/tree2.glb');
useGLTF.preload('/models/tree3.glb');
useGLTF.preload('/models/tree4.glb');
useGLTF.preload('/models/tree5.glb');
useGLTF.preload('/models/tree6.glb');