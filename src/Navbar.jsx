import React from 'react';

export function Navbar({ onSectionChange, activeOverlay }) {
  const navItems = [
    { label: "About", id: "about" },
    { label: "Skills", id: "skills" },
    { label: "Projects", id: "projects" },
    { label: "Contact", id: "contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50">
      <div className="flex justify-center items-center gap-12 py-5 bg-black/10 backdrop-blur-md border-b border-white/10 shadow-lg">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id === activeOverlay ? null : item.id)}
            className={`
              text-sm font-bold uppercase tracking-[0.2em] transition-all duration-300
              ${activeOverlay === item.id 
                ? 'text-red-400 scale-110' 
                : 'text-white/80 hover:text-white hover:scale-105'}
            `}
          >
            {item.label}
          </button>
        ))}
        
        {/* Close Button: Only appears when an overlay is active */}
        {activeOverlay && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
            <button 
                onClick={() => onSectionChange(null)}
                className="text-white/50 text-xs font-mono hover:text-white uppercase tracking-wider transition-colors border px-3 py-1 rounded border-white/20 hover:border-white"
            >
                Close ✕
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}