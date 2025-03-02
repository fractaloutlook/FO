import React, { useEffect, useState } from 'react';
//import initializeSpacetimeDB from '../../utils/spacetimeDBClient.jsx';

const TestSDK = () => {
  const [sdkStatus, setSdkStatus] = useState('Not initialized');
  
  useEffect(() => {
    try {
      console.log('Initializing SpacetimeDB SDK...');
      
      /*
      // Initialize the SpacetimeDB client
      const isInitialized = initializeSpacetimeDB();
      setSdkStatus(isInitialized ? 'Initialized' : 'Initialization failed');
      
      // Try to get the DBConnection class
      const hasDBConnection = !!window.DBConnection;
      console.log('DBConnection available:', hasDBConnection);
      
      if (hasDBConnection) {
        console.log('DBConnection object:', window.DBConnection);
      }

      */
    } catch (error) {
      console.error('Error in TestSDK component:', error);
      setSdkStatus(`Error: ${error.message}`);
    }
  }, []);

  return (
    <div className="bg-gray-100 p-3 mb-4 rounded-md text-sm">
      <h3 className="font-medium mb-1">SpacetimeDB SDK Test</h3>
      <div>Status: <span className={sdkStatus.includes('Error') ? 'text-red-500' : 'text-green-500'}>{sdkStatus}</span></div>
      <div className="mt-1 text-xs">Check the console for detailed logs</div>
    </div>
  );
};

export default TestSDK;