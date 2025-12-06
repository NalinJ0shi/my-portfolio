import { useState, useEffect } from 'react';

export function SkillsSection({ scrollProgress, isSectionActive }) {
  const [isVisible, setIsVisible] = useState(false);
  
  // Visibility is now controlled by the cube click
  useEffect(() => {
    setIsVisible(isSectionActive);
  }, [isSectionActive]);
  
  const skills = [
    "React", "Three.js", "JavaScript", "3D Modeling", "Tailwind CSS", "WebGL"
  ];
  
  return (
    // pointer-events-none allows clicks to pass through empty space
    <section className="h-screen flex items-center justify-end pt-16 relative z-10 pointer-events-none">
      <div 
        // pointer-events-auto restores interactions for the content box
        className={`bg-opacity-75 p-6 rounded-lg max-w-lg mr-10 transition-all duration-700 ease-in-out pointer-events-auto ${
          isVisible 
            ? 'opacity-100 translate-x-0' 
            : 'opacity-0 translate-x-20'
        }`}
      >
        <h2 className="text-4xl font-bold mb-4 text-white">Skills</h2>
        <div className="grid grid-cols-2 gap-2">
          {skills.map((skill, index) => (
            <div 
              key={skill}
              className="p-2 bg-red bg-opacity-10 rounded text-white"
              style={{
                transitionDelay: `${index * 100}ms`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 500ms ease, transform 500ms ease'
              }}
            >
              {skill}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}