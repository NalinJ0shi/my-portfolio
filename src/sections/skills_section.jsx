import { useState, useEffect } from 'react';

export function SkillsSection({ scrollProgress }) {
  const [isVisible, setIsVisible] = useState(false);
  
  // Show section when scroll progress reaches a certain threshold
  useEffect(() => {
    if (scrollProgress > 0.25 && scrollProgress < 0.55) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [scrollProgress]);
  
  const skills = [
    "React", "Three.js", "JavaScript", "3D Modeling", "Tailwind CSS", "WebGL"
  ];
  
  return (
    <section className="h-screen flex items-center justify-end pt-16 relative z-10">
      <div 
        className={`bg-opacity-75 p-6 rounded-lg max-w-lg mr-10 transition-all duration-700 ease-in-out ${
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