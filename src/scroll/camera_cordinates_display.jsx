import { useState, useEffect, useRef } from 'react';

export function CameraCoordinatesDisplay({ cameraRef, scrollProgress }) {
  const [coordinates, setCoordinates] = useState({ x: 5, y: 8, z: 10 });
  const [isVisible, setIsVisible] = useState(true);
  
  // Update coordinates when camera moves
  useEffect(() => {
    if (!cameraRef?.current) return;
    
    const updateCoordinates = () => {
      if (cameraRef.current) {
        const pos = cameraRef.current.position;
        setCoordinates({
          x: pos.x.toFixed(2),
          y: pos.y.toFixed(2),
          z: pos.z.toFixed(2)
        });
      }
    };
    
    // Update coordinates on animation frame
    const animate = () => {
      updateCoordinates();
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [cameraRef]);
  
  // Toggle visibility
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
  
  if (!isVisible) {
    return (
      <button
        onClick={toggleVisibility}
        className="fixed top-4 right-4 bg-white bg-opacity-20 text-white px-3 py-1 rounded-md z-30 hover:bg-opacity-30 transition-all duration-200"
      >
        Show Camera Coords
      </button>
    );
  }
  
  return (
    <div className="fixed top-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg z-30 font-mono text-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">Camera Position</h3>
        <button
          onClick={toggleVisibility}
          className="text-white hover:text-gray-300 transition-colors duration-200"
        >
          ✕
        </button>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-red-300">X:</span>
          <span className="text-white">{coordinates.x}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-300">Y:</span>
          <span className="text-white">{coordinates.y}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-blue-300">Z:</span>
          <span className="text-white">{coordinates.z}</span>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-500">
        <div className="text-xs text-gray-300">
          Scroll: {(scrollProgress * 100).toFixed(1)}%
        </div>
      </div>
    </div>
  );
}