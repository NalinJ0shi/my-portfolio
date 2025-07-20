import { useState, useEffect } from 'react';

export function LoadingScreen({ progress, isComplete, onComplete }) {
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    if (isComplete && !animateOut) {
      setAnimateOut(true);
      // Wait for animation to complete before calling onComplete
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 1000);
    }
  }, [isComplete, animateOut, onComplete]);

  return (
    <div className={`fixed inset-0 bg-black flex items-center justify-center z-50 transition-opacity duration-1000 ${
      animateOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-white text-2xl font-bold mb-2">Loading Experience</h2>
        <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-white text-sm mt-2">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}

export default LoadingScreen;