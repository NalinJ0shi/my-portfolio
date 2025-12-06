import { useState, useEffect } from 'react';

export function ProjectsSection({ scrollProgress, isSectionActive }) {
  const [isVisible, setIsVisible] = useState(false);
  
  // Visibility is now controlled by the cube click
  useEffect(() => {
    setIsVisible(isSectionActive);
  }, [isSectionActive]);
  
  // Use an array of objects for richer project data
  const projects = [
    {
      title: "The Last Gate",
      description: "A fast-paced 2D pixel-art mobile arcade game developed using Unity. Available on the Google Play Store.",
      link: "https://play.google.com/store/apps/details?id=com.NalinJoshi.TheLastGate", 
      imageUrl: "/last_gate.png" 
    },
    // You can add more projects here later!
  ];
  
  return (
    // pointer-events-none allows clicks to pass through empty space
    <section className="h-screen flex items-center justify-start pt-16 relative z-10 pointer-events-none">
      <div 
        // pointer-events-auto allows you to click the links inside this div
        className={`p-6 max-w-lg ml-10 transition-all duration-700 ease-in-out pointer-events-auto ${
          isVisible 
            ? 'opacity-100 translate-x-0' 
            : 'opacity-0 -translate-x-20'
        }`}
      >
        
        {/* Title for the section */}
        <h2 className="text-4xl font-bold mb-8 text-white">My Projects</h2>
        
        {/* Map through the projects array */}
        <div className="space-y-6">
          {projects.map((project, index) => (
            <a 
              key={index}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-lg transition-all duration-300 group cursor-pointer"
              style={{
                transitionDelay: `${index * 150}ms`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 500ms ease, transform 500ms ease, background-color 300ms'
              }}
            >
              
              {/* Project Image/Screenshot */}
              {/* CHANGED: w-full -> w-3/4, added mx-auto to center, h-48 -> h-64 */}
              <div 
                className="w-3/4 h-64 mx-auto bg-gray-500 rounded-lg mb-4 flex items-center justify-center overflow-hidden border border-gray-600 group-hover:border-white transition-colors"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transition: 'opacity 500ms ease',
                  transitionDelay: `${index * 150 + 100}ms`
                }}
              >
                <img src={project.imageUrl} alt={`Screenshot of ${project.title}`} className="w-full h-full object-cover" />
              </div>
              
              {/* Title and Description */}
              <h3 className="text-2xl font-semibold mb-1 text-white group-hover:text-red-300 transition-colors">
                {project.title}
              </h3>
              <p className="text-white text-opacity-70 mb-2">{project.description}</p>
              <span className="text-sm font-mono text-red-400">View on Play Store &rarr;</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}