// friendlyName.js
const animals = [
  'octopus',
  'marmoset',
  'kangaroo',
  'penguin',
  'tiger',
  'panda',
  'elephant',
  'dolphin'
];

const colors = [
  'red',
  'blue',
  'green',
  'yellow',
  'purple',
  'orange',
  'pink',
  'white'
];

// Simple hash function (djb2)
function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return hash >>> 0; // Convert to unsigned integer
}
function betterHash(id) {
    let hash = 0;
    const str = id.toString();
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31) ^ str.charCodeAt(i);
    }
    return hash >>> 0; // Ensure positive
  }
  export function getFriendlyName(sender) {
    if (!sender || typeof sender.toHexString !== 'function') {
      return "unknown_user";
    }
  
    const idStr = sender.toHexString(); // Get hex string from Identity
    const hash = betterHash(idStr);
  
    // Use different parts of the hash for animal and color to ensure variety
    const animalIndex = hash % animals.length;
    const colorIndex = Math.floor(hash / animals.length) % colors.length;
    
    const animal = animals[animalIndex];
    const color = colors[colorIndex];
  
    // Return in correct order: color_animal (like blue_elephant)
    return `${color}_${animal}`;
  }
