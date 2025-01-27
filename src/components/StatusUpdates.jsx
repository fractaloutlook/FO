import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const StatusUpdates = () => {
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');

  useEffect(() => {
    const initializeConnection = async () => {
      try {
        console.log('Starting SpaceTimeDB connection setup...');
        const { Client } = await import('@clockworklabs/spacetimedb-sdk');
        
        const client = new Client('wss://testnet.spacetimedb.com', 'status-module');
        
        client.on('connect', () => {
          console.log('Connected!');
          setConnectionStatus('Connected to SpaceTimeDB');
        });

        client.on('error', (error) => {
          console.error('Connection error:', error);
          setConnectionStatus(`Connection error: ${error.message}`);
        });

        client.connect();
      } catch (error) {
        console.error('Initialization error:', error);
        setConnectionStatus(`Initialization error: ${error.message}`);
      }
    };

    initializeConnection();
  }, []);

  return (
    <div className="space-y-4 mt-8">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle size={18} className="text-blue-500" />
          <h3 className="font-medium text-gray-900">Current Status:</h3>
        </div>
        <p className="text-gray-700">{connectionStatus}</p>
      </div>
    </div>
  );
};

export default StatusUpdates;