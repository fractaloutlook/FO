import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const StatusUpdates = () => {
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');
  const [client, setClient] = useState(null);

  useEffect(() => {
    const initializeConnection = async () => {
      try {
        const sdk = await import('@clockworklabs/spacetimedb-sdk');
        console.log('Available SDK exports:', sdk);
        
        const connection = sdk.default
          .withAddress('wss://testnet.spacetimedb.com')
          .withModule('status-module')
          .withCallbacks({
            onConnect: (token, identity) => {
              console.log('Connected with identity:', identity);
              setConnectionStatus('Connected to SpaceTimeDB');
              localStorage.setItem('stdb_token', token);
            },
            onConnectionError: (error) => {
              console.error('Connection error:', error);
              setConnectionStatus(`Connection error: ${error.message}`);
            },
            onDisconnect: () => {
              setConnectionStatus('Disconnected');
            }
          })
          .build();

        const savedToken = localStorage.getItem('stdb_token');
        if (savedToken) {
          connection.withToken(savedToken);
        }

        await connection.connect();
        setClient(connection);
        
      } catch (error) {
        console.error('Initialization error:', error);
        setConnectionStatus(`Initialization error: ${error.message}`);
      }
    };

    initializeConnection();

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