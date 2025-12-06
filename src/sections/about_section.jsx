import { useState, useEffect } from 'react';

export function AboutSection({ scrollProgress, isSectionActive }) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(isSectionActive);
  }, [isSectionActive]);
  
  return (
    <section className="h-screen flex items-center justify-start pt-16 relative z-10 pointer-events-none">
      <div 
        // --- NEW DESIGN ---
        // 1. bg-white/10: Very transparent white (10% opacity)
        // 2. backdrop-blur-md: Blurs the 3D scene behind the box
        // 3. border-white/20: Subtle border
        // 4. shadow-xl: Soft shadow to separate it from the background
        className={`
            bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl
            p-8 rounded-2xl max-w-lg ml-10 
            transition-all duration-700 ease-in-out pointer-events-auto 
            ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}
        `}
      >
        {/* Added drop-shadow-lg to ALL text so it pops against any background */}
        <h2 className="text-4xl font-bold mb-6 text-white drop-shadow-lg">
          About Me
        </h2>
        
        <div className="space-y-4 text-lg text-white font-light drop-shadow-md">
          <p>
            I am a creative developer with a passion for building immersive digital experiences 
            that blend technical expertise with artistic vision.
          </p>
          <p>
            With a background in both design and development, I create unique web experiences 
            that engage users and tell compelling stories.
          </p>
          <p>
            My work focuses on the intersection of 3D visualization, interactive design, 
            and cutting-edge web technologies.
          </p>
        </div>

        {/* Subtle close instruction */}
        <div className="mt-6 text-sm text-gray-300 opacity-60">
           (Scroll to close)
        </div>
      </div>
    </section>
  );
}