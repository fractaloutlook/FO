import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import * as STDB from '@clockworklabs/spacetimedb-sdk';

const StatusUpdates = () => {
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');
  const [statusMessage, setStatusMessage] = useState('');
  const [client, setClient] = useState(null);

  useEffect(() => {
    const connectToDatabase = async () => {
      try {
        console.log('STDB object:', STDB);
        console.log('Initializing connection...');
        
        const connection = STDB.DBConnection.builder()
          .withUri('wss://testnet.spacetimedb.com')
          .withModuleName('status-module')
          .onConnect((conn, identity, token) => {
            console.log('Connected!', { identity, token });
            setConnectionStatus('Connected');
            localStorage.setItem('stdb_token', token);
            
            conn.subscriptionBuilder()
              .onApplied((ctx) => {
                console.log('Subscription applied!');
                const status = conn.db.currentStatus.id.find(0);
                if (status) {
                  setStatusMessage(status.message);
                }
              })
              .subscribe(['SELECT * FROM current_status']);
          })
          .onConnectError((conn, error) => {
            console.error('Connection error:', error);
            setConnectionStatus(`Connection error: ${error.message}`);
          })
          .onDisconnect((conn, error) => {
            console.log('Disconnected', error);
            setConnectionStatus('Disconnected');
          })
          .build();

        setClient(connection);
        await connection.connect();

      } catch (error) {
        console.error('Failed to initialize:', error);
        setConnectionStatus(`Initialization error: ${error.message}`);
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