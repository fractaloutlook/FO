import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import * as STDB from '@clockworklabs/spacetimedb-sdk';

// Basic component structure that works
// ATTEMPT #1 - Basic setup with just UI
const StatusUpdates = () => {
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');
  const [statusMessage, setStatusMessage] = useState('');

  // ATTEMPT #2 - Basic DBConnectionBuilder without module config
  useEffect(() => {
    const connectToDatabase = async () => {
      try {
        // Log what we're working with
        console.log('Starting connection attempt #2');
        console.log('DBConnectionBuilder available:', !!STDB.DBConnectionBuilder);
        
        const builder = new STDB.DBConnectionBuilder();
        console.log('Builder created:', builder);
        
        // Just try the absolute basics first
        const connection = builder
          .withUri('wss://testnet.spacetimedb.com')
          .withModuleName('status-module')
          .build();
          
        console.log('Connection built:', connection);

      } catch (error) {
        console.error('Failed to initialize:', error);
        setConnectionStatus(`Error: ${error.message}`);
      }
    };

    connectToDatabase();
  }, []);

  return (
    <div className="space-y-4 mt-8">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle size={18} className="text-blue-500" />
          <h3 className="font-medium text-gray-900">Status:</h3>
        </div>
        <p className="text-gray-700">
          {connectionStatus}
          {statusMessage && (
            <span className="block mt-2">
              Message: {statusMessage}
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default StatusUpdates;