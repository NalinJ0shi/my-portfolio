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

function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isActivelyScrolling, setIsActivelyScrolling] = useState(false);
  const [cameraRef, setCameraRef] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const scrollTimeout = useRef(null);
  
  // Set the void color - a very dark purple matching the first image
  const voidColor = "#617969ff"; // Very dark purple/almost black
  
  // Handle background initialization sequence
  useEffect(() => {
    let timer;
    let phase = 0;
    const phases = [
      () => setLoadingProgress(30), // Model loading
      () => {
        // Phase 1: Scroll to 2.1%
        setScrollProgress(0.021);
        setLoadingProgress(60);
      },
      () => {
        // Phase 2: Scroll back to 0%
        setScrollProgress(0);
        setLoadingProgress(90);
      },
      () => {
        // Phase 3: Complete loading
        setLoadingProgress(100);
      }
    ];

    const runPhase = () => {
      if (phase < phases.length) {
        phases[phase]();
        phase++;
        timer = setTimeout(runPhase, 800); // 800ms between phases
      }
    };

    // Start the sequence
    timer = setTimeout(runPhase, 500);

    return () => clearTimeout(timer);
  }, []);

  // Handle model loaded callback
  const handleModelLoaded = () => {
    // Model is loaded, continue with scroll sequence
  };

  // Handle loading completion
  const handleLoadingComplete = () => {
    setShowContent(true);
  };
  
  // Handle scroll events
  useEffect(() => {
    if (!showContent) return; // Don't handle scroll until content is shown
    
    const handleScroll = () => {
      // Calculate scroll progress (0 to 1)
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(window.scrollY / totalHeight, 1);
      setScrollProgress(progress);
      
      // Set actively scrolling to true
      setIsActivelyScrolling(true);
      
      // Clear any existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      
      // Set a timeout to detect when scrolling stops
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

  // Callback to receive camera ref from ScrollableScene
  const handleCameraRef = (ref) => {
    setCameraRef(ref);
  };

  return (
    <div className="min-h-[500vh] text-white" style={{ backgroundColor: voidColor, transition: 'background-color 0.5s ease' }}>
      {/* Loading Screen */}
      <LoadingScreen 
        progress={loadingProgress} 
        isComplete={loadingProgress >= 100} 
        onComplete={handleLoadingComplete} 
      />
      
      {/* Main Content */}
      <div className={`transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <div className="fixed inset-0">
          <Canvas>
            <Suspense fallback={null}>
              <ScrollableScene 
                scrollProgress={scrollProgress} 
                isActivelyScrolling={isActivelyScrolling}
                modelUrl="/models/man.glb"
                onCameraRef={handleCameraRef}
                onModelLoaded={handleModelLoaded}
              />
              
              {/* Enhanced lighting for the scene */}
              <ambientLight intensity={0.3} />
              <directionalLight position={[10, 10, 5]} intensity={0.8} color="#e2e2ff" />
              <spotLight 
                position={[0, 10, 0]} 
                intensity={0.8} 
                angle={0.6} 
                penumbra={0.5} 
                castShadow 
                color="#f6e3ff" 
              />
              
              {/* Ground plane */}
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
        
        {/* Camera Coordinates Display */}
        <CameraCoordinatesDisplay 
          cameraRef={cameraRef} 
          scrollProgress={scrollProgress} 
        />
        
        {/* Content sections */}
        <IntroSection />
        <AboutSection scrollProgress={scrollProgress} />
        <SkillsSection scrollProgress={scrollProgress} />
        <ProjectsSection scrollProgress={scrollProgress} />
        <ContactSection scrollProgress={scrollProgress} />
        
        {/* Scroll indicator */}
        <ScrollIndicator isVisible={scrollProgress < 0.05} />
        
      </div>
    </div>
  );
}

export default App;