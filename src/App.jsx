import { Canvas } from '@react-three/fiber';
import { Suspense, useState, useEffect, useRef } from 'react';
import { ScrollableScene } from './scroll/scrollable_character';
import { IntroSection } from './sections/intro_section';
import { AboutSection } from './sections/about_section';
import { SkillsSection } from './sections/skills_section';
import { ProjectsSection } from './sections/projects_section';
import { ContactSection } from './sections/contact_section';
import { ScrollIndicator } from './scroll/scroll_indicator';
import { CameraCoordinatesDisplay } from './scroll/camera_cordinates_display';
import LoadingScreen from './scroll/loadingscreen';
import { SectionCubes } from './SectionCubes';

function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isActivelyScrolling, setIsActivelyScrolling] = useState(false);
  const [cameraRef, setCameraRef] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const scrollTimeout = useRef(null);
  const [activeSectionId, setActiveSectionId] = useState(null);
  
  // 🚀 FIXED: This single color controls Sky, Fog, and Floor for a seamless look
  const voidColor = "#c7ecc7"; 
  
  useEffect(() => {
    let timer;
    let phase = 0;
    const phases = [
      () => setLoadingProgress(30),
      () => {
        setScrollProgress(0.0021);
        setLoadingProgress(60);
      },
      () => {
        setScrollProgress(0);
        setLoadingProgress(90);
      },
      () => {
        setLoadingProgress(100);
      }
    ];

    const runPhase = () => {
      if (phase < phases.length) {
        phases[phase]();
        phase++;
        timer = setTimeout(runPhase, 800); 
      }
    };

    timer = setTimeout(runPhase, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleLoadingComplete = () => {
    setShowContent(true);
  };
  
  useEffect(() => {
    if (!showContent) return; 
    
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(window.scrollY / totalHeight, 1);
      setScrollProgress(progress);
      
      setIsActivelyScrolling(true);
      
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      
      scrollTimeout.current = setTimeout(() => {
        setIsActivelyScrolling(false);
      }, 150);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [showContent]);

  const handleCameraRef = (ref) => {
    setCameraRef(ref);
  };

  return (
    // 1. HTML Background matches voidColor
    <div className="min-h-[1500vh] text-white" style={{ backgroundColor: voidColor, transition: 'background-color 0.5s ease' }}>
      
      <LoadingScreen 
        progress={loadingProgress} 
        isComplete={loadingProgress >= 100} 
        onComplete={handleLoadingComplete} 
      />
      
      <div className={`transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <div className="fixed inset-0">
          <Canvas>
            <Suspense fallback={null}>
              {/* 2. 3D Sky matches voidColor */}
              <color attach="background" args={[voidColor]} />

              {/* 3. Fog matches voidColor (This hides the line!) */}
              <fog attach="fog" args={[voidColor, 10, 60]} /> 

              <ScrollableScene 
                scrollProgress={scrollProgress} 
                isActivelyScrolling={isActivelyScrolling}
                modelUrl="/models/man.glb"
                onCameraRef={handleCameraRef}
              />       
              
              <SectionCubes scrollProgress={scrollProgress} onCubeClick={setActiveSectionId} /> 
              
              <ambientLight intensity={0.3} />
              <directionalLight position={[10, 10, 5]} intensity={0.8} color="#e2e2ff" />
              <spotLight position={[0, 10, 0]} intensity={0.8} angle={0.6} penumbra={0.5} castShadow color="#f6e3ff" />
              <pointLight position={[-5, 5, 5]} intensity={1.5} distance={20} color="#c7faff" />
              
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
                <planeGeometry args={[1000, 1000]} />
                <meshStandardMaterial 
                  color={voidColor} 
                  roughness={0.75}
                  metalness={0.2}
                  emissive="#ac95cdff"
                  emissiveIntensity={0.05}
                />
              </mesh>
            </Suspense>
          </Canvas>
        </div>
        
        <CameraCoordinatesDisplay cameraRef={cameraRef} scrollProgress={scrollProgress} />
        
        <IntroSection />
        <AboutSection scrollProgress={scrollProgress} isSectionActive={activeSectionId === 2 || activeSectionId === 3} />
        <SkillsSection scrollProgress={scrollProgress} isSectionActive={activeSectionId === 4 || activeSectionId === 5} />
        <ProjectsSection scrollProgress={scrollProgress} isSectionActive={activeSectionId === 6 || activeSectionId === 7} />
        <ContactSection scrollProgress={scrollProgress} isSectionActive={activeSectionId === 8 || activeSectionId === 9} />
        
        <ScrollIndicator isVisible={scrollProgress < 0.05} />
        
      </div>
    </div>
  );
}

export default App;