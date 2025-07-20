import { useState } from 'react';

export function LightControls({ onIntensityChange, onDistanceChange, initialIntensity = 2, initialDistance = 15 }) {
  const [intensity, setIntensity] = useState(initialIntensity);
  const [distance, setDistance] = useState(initialDistance);
  const [isVisible, setIsVisible] = useState(true);

  const handleIntensityChange = (e) => {
    const value = parseFloat(e.target.value);
    setIntensity(value);
    onIntensityChange(value);
  };

  const handleDistanceChange = (e) => {
    const value = parseFloat(e.target.value);
    setDistance(value);
    onDistanceChange(value);
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed top-4 left-4 bg-white bg-opacity-20 text-white px-3 py-1 rounded-md z-30 hover:bg-opacity-30 transition-all duration-200"
      >
        Show Light Controls
      </button>
    );
  }

  return (
    <div className="fixed top-4 left-4 bg-black bg-opacity-50 text-white p-4 rounded-lg z-30 font-mono text-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">Light Controls</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-gray-300 transition-colors duration-200"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Intensity: {intensity}</label>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={intensity}
            onChange={handleIntensityChange}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        <div>
          <label className="block text-sm mb-1">Distance: {distance}</label>
          <input
            type="range"
            min="5"
            max="100"
            step="1"
            value={distance}
            onChange={handleDistanceChange}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}