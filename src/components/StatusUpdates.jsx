import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { DBConnectionBuilder } from '@clockworklabs/spacetimedb-sdk';

const StatusUpdates = () => {
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');
  const [client, setClient] = useState(null);

  useEffect(() => {
    const connectToDatabase = async () => {
      try {
        console.log('Starting connection...');
        
        const builder = new DBConnectionBuilder()
          .withUri('wss://testnet.spacetimedb.com')
          .withModuleName('status-module')
          .onConnect((token, identity) => {
            console.log('Connected with:', { token, identity });
            setConnectionStatus('Connected!');
          })
          .build();

        console.log('Connection built:', builder);
        
        builder.connect();
        setClient(builder);

      } catch (error) {
        console.error('Connection error:', error);
        setConnectionStatus(`Connection error: ${error.message}`);
      }
    };

    connectToDatabase();

    return () => {
      if (client) {
        client.disconnect();
      }
    };
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