import { Canvas } from '@react-three/fiber';
import { Suspense, useState, useEffect, useRef } from 'react';
import { ScrollableScene } from './scroll/scrollable_character';
import { IntroSection } from './sections/intro_section';
import { AboutSection } from './sections/about_section';
import { SkillsSection } from './sections/skills_section';
import { ProjectsSection } from './sections/projects_section';
import { ContactSection } from './sections/contact_section';
import { ScrollIndicator } from './scroll/scroll_indicator';
import LoadingScreen from './scroll/loadingscreen';
import { SectionCubes } from './SectionCubes';
import { Navbar } from './Navbar'; 
import { FinalScene } from './FinalScene'; // Added Import

function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isActivelyScrolling, setIsActivelyScrolling] = useState(false);
  const [cameraRef, setCameraRef] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const scrollTimeout = useRef(null);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [activeOverlay, setActiveOverlay] = useState(null);
  
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
      
      // Close overlay on scroll
      if(activeOverlay) setActiveOverlay(null); 
      
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
  }, [showContent, activeOverlay]); 

  const handleCameraRef = (ref) => {
    setCameraRef(ref);
  };

  return (
    <div className="min-h-[1500vh] text-white" style={{ backgroundColor: voidColor, transition: 'background-color 0.5s ease' }}>
      
      <LoadingScreen 
        progress={loadingProgress} 
        isComplete={loadingProgress >= 100} 
        onComplete={handleLoadingComplete} 
      />
      
      <div className={`transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* --- 1. THE 3D CANVAS --- */}
        <div className="fixed inset-0 z-0">
          <Canvas>
            <Suspense fallback={null}>
              <color attach="background" args={[voidColor]} />
              <fog attach="fog" args={[voidColor, 10, 60]} /> 

              <ScrollableScene 
                scrollProgress={scrollProgress} 
                isActivelyScrolling={isActivelyScrolling}
                modelUrl="/models/man.glb"
                onCameraRef={handleCameraRef}
              />       
              
              <SectionCubes 
                scrollProgress={scrollProgress} 
                onCubeClick={setActiveSectionId} 
                onSectionSelect={setActiveOverlay}
              /> 

              {/* Added Final Forest Scene */}
              <FinalScene scrollProgress={scrollProgress} />
              
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
        
        {/* --- 2. BLUR OVERLAY --- */}
        <div 
          className={`
            fixed inset-0 z-20 bg-black/40 backdrop-blur-md transition-opacity duration-500 ease-in-out
            ${activeOverlay ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
          `}
          onClick={() => setActiveOverlay(null)} 
        />
        
        {/* --- 3. SECTIONS (Text Content) --- */}
        <div className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-center">
            
            {/* Intro: Only visible at start and if no overlay is active */}
            <div 
              className={`
                 absolute inset-0 flex items-center justify-center transition-opacity duration-500
                 ${(scrollProgress < 0.02 && !activeOverlay) ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
              `}
            >
              <IntroSection />
            </div>

            {/* Content Sections */}
            <div className="absolute inset-0 flex items-center">
               <AboutSection 
                 scrollProgress={scrollProgress} 
                 isSectionActive={activeOverlay === 'about' || (activeSectionId === 2 || activeSectionId === 3)} 
               />
            </div>
            
            <div className="absolute inset-0 flex items-center">
               <SkillsSection 
                 scrollProgress={scrollProgress} 
                 isSectionActive={activeOverlay === 'skills' || (activeSectionId === 4 || activeSectionId === 5)} 
               />
            </div>
            
            <div className="absolute inset-0 flex items-center">
               <ProjectsSection 
                 scrollProgress={scrollProgress} 
                 isSectionActive={activeOverlay === 'projects' || (activeSectionId === 6 || activeSectionId === 7)} 
               />
            </div>
            
            <div className="absolute inset-0 flex items-center">
               <ContactSection 
                 scrollProgress={scrollProgress} 
                 isSectionActive={activeOverlay === 'contact' || (activeSectionId === 8 || activeSectionId === 9)} 
               />
            </div>
        </div>
        
        <ScrollIndicator isVisible={scrollProgress < 0.02 && !activeOverlay} />
        
        {/* --- 4. NAVIGATION BAR (Updated position is inside Navbar.jsx) --- */}
        <Navbar onSectionChange={setActiveOverlay} activeOverlay={activeOverlay} />
        
      </div>
    </div>
  );
}

export default App;