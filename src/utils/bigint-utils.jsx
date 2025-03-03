// Helper functions to handle BigInt serialization and unique IDs

// Safe JSON stringify for objects containing BigInt values and avoiding circular references
export const safeJsonStringify = (obj) => {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    // Handle bigint values
    if (typeof value === 'bigint') {
      return value.toString();
    }
    
    // Handle circular references
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    
    return value;
  });
};

// Generate a unique ID with a counter to prevent collisions
let counter = 0;
export const generateUniqueId = (prefix = 'temp') => {
  counter++;
  return `${prefix}-${Date.now()}-${counter}`;
};

// Convert BigInt timestamps to Date objects safely
export const bigIntToDate = (timestamp) => {
  if (timestamp === undefined || timestamp === null) {
    return new Date();
  }
  
  // Handle different possible timestamp formats
  try {
    // If it's already a number or can be used as one
    if (typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    
    // If it's a BigInt or a string representation of a BigInt
    const timeValue = typeof timestamp === 'bigint' 
      ? Number(timestamp) 
      : Number(timestamp.toString());
      
    // SpacetimeDB timestamps are in microseconds, convert to milliseconds
    return new Date(timeValue / 1000);
  } catch (e) {
    console.warn('Failed to convert timestamp', timestamp, e);
    return new Date();
  }
};
