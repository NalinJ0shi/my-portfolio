import { useState, useEffect } from 'react';

export function ContactSection({ scrollProgress }) {
  const [isVisible, setIsVisible] = useState(false);
  
  // Show section when scroll progress reaches a certain threshold
  useEffect(() => {
    if (scrollProgress > 0.65) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [scrollProgress]);
  
  return (
    <section className="h-screen flex items-center justify-center pt-16 relative z-10">
      <div 
        className={`bg-opacity-75 p-6 rounded-lg max-w-lg transition-all duration-700 ease-in-out ${
          isVisible 
            ? 'opacity-100 scale-100' 
            : 'opacity-0 scale-95'
        }`}
      >
      </div>
    </section>
  );
}