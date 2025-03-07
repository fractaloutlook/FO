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
    if (!sender || !sender.data) return "Unknown_User"; // Handle edge cases
  
    const idStr = sender.data.toString(); // Convert BigInt to string
    const hash = betterHash(idStr);
  
    const animal = animals[hash % animals.length];
    const color = colors[(hash >> 3) % colors.length];
  
    return `${animal}_${color}`;
  }
