import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import * as STDB from '@clockworklabs/spacetimedb-sdk';

const StatusUpdates = () => {
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');
  const [statusMessage, setStatusMessage] = useState('');
  const [client, setClient] = useState(null);

  useEffect(() => {
    const connectToDatabase = async () => {
      try {
        console.log('Initializing connection...');
        
        // Create connection using the builder pattern
        const connection = STDB.DBConnection.builder()
          .withUri('ws://localhost:3000')
          .withModuleName('status-module')
          .onConnect((conn, identity, token) => {
            console.log('Connected!', { identity, token });
            setConnectionStatus('Connected');
            localStorage.setItem('stdb_token', token);
            
            // Subscribe to all tables
            conn.subscriptionBuilder()
              .onApplied((ctx) => {
                console.log('Subscription applied!');
                // Get current status from the table
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

        // Store reference to client
        setClient(connection);

        // Initiate connection
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
    <div className="space-y-4">
      <Alert variant={connectionStatus === 'Connected' ? 'default' : 'destructive'}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Status Updates</AlertTitle>
        <AlertDescription>
          Connection Status: {connectionStatus}
          {statusMessage && (
            <div className="mt-2 text-sm">
              Current Status: {statusMessage}
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default StatusUpdates;