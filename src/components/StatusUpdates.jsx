import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import * as STDB from '@clockworklabs/spacetimedb-sdk';

const StatusUpdates = () => {
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');
  const [client, setClient] = useState(null);

  useEffect(() => {
    const connectToDatabase = async () => {
      try {
        console.log('SDK object:', STDB);
        
        // Create connection using new SDK syntax
        const conn = STDB.DBConnectionBuilder()
          .withUri('wss://testnet.spacetimedb.com')
          .withModuleName('status-module')
          .onConnect((token, identity) => {
            console.log('Connected!', { token, identity });
            setConnectionStatus('Connected!');
            localStorage.setItem('stdb_token', token);
          })
          .onConnectionError((error) => {
            console.error('Failed to connect:', error);
            setConnectionStatus(`Connection error: ${error.message}`);
          })
          .onDisconnect(() => {
            console.log('Disconnected');
            setConnectionStatus('Disconnected');
          })
          .build();

        // If we have a saved token
        const savedToken = localStorage.getItem('stdb_token');
        if (savedToken) {
          conn.withToken(savedToken);
        }

        conn.connect();
        setClient(conn);

      } catch (error) {
        console.error('Failed to initialize:', error);
        setConnectionStatus(`Failed to initialize: ${error.message}`);
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