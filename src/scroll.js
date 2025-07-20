// Utility functions for animation handling

export function findAnimationByName(animations, name) {
  return animations.find(anim => 
    anim.name.toLowerCase().includes(name.toLowerCase())
  );
}

export function detectAnimations(animations) {
  const detected = {};
  
  // Common animation name patterns
  const patterns = {
    idle: ['idle', 'stand', 'rest', 'wait', 'default'],
    walk: ['walk', 'run', 'move', 'step', 'locomotion'],
    jump: ['jump', 'leap', 'hop'],
    dance: ['dance', 'groove', 'move']
  };
  
  // Check each animation against patterns
  animations.forEach(animation => {
    const animName = animation.name.toLowerCase();
    
    Object.keys(patterns).forEach(type => {
      patterns[type].forEach(pattern => {
        if (animName.includes(pattern) && !detected[type]) {
          detected[type] = animation.name;
        }
      });
    });
  });
  
  return detected;
}

export function transitionAnimation(actions, fromAnim, toAnim, duration = 0.5) {
  if (!actions[fromAnim] || !actions[toAnim]) return;
  
  // Stop current animation
  actions[fromAnim]?.fadeOut(duration);
  
  // Start new animation
  actions[toAnim]?.reset().fadeIn(duration).play();
}