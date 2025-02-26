import { DBConnectionImpl, DBConnectionBuilder } from '@clockworklabs/spacetimedb-sdk';

// This will make our module bindings available globally
// Import this file early in your application startup
const initializeSpacetimeDB = () => {
  try {
    // Make these accessible globally for convenience
    window.DBConnection = DBConnectionImpl;
    window.DBConnectionBuilder = DBConnectionBuilder;

    console.log('SpacetimeDB client initialized globally');
    return true;
  } catch (error) {
    console.error('Error initializing SpacetimeDB client:', error);
    return false;
  }
};

export default initializeSpacetimeDB;