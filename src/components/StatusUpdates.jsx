import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import * as STDB from '@clockworklabs/spacetimedb-sdk';

// Import our generated table types
import { CurrentStatus } from '../module_bindings/current_status_table';
import { UpdateLog } from '../module_bindings/update_log_table';
import { Admin } from '../module_bindings/admin_table';

// Determine if we're in development or production
const isLocalDevelopment = window.location.hostname === 'localhost';
const STDB_URL = isLocalDevelopment 
  ? 'ws://localhost:3000'
  : 'wss://testnet.spacetimedb.com';

const StatusUpdates = () => {
  const [client, setClient] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('');
  const [updates, setUpdates] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');

  useEffect(() => {
    console.log(`Connecting to SpaceTimeDB at ${STDB_URL}`);
    
    // Create connection builder from SDK
    const builder = STDB.DBConnectionBuilder()
      .withAddress(STDB_URL)
      .withModule('status-module')
      .onConnect((token, identity) => {
        console.log('Connected to SpaceTimeDB:', { token, identity });
        setConnectionStatus('Connected!');
        localStorage.setItem('stdb_token', token);
      })
      .onConnectionError((error) => {
        console.error('Connection error:', error);
        setConnectionStatus(`Connection error: ${error.message}`);
      })
      .onDisconnect(() => {
        setConnectionStatus('Disconnected');
      });

    // If we have a saved token, use it
    const savedToken = localStorage.getItem('stdb_token');
    if (savedToken) {
      builder.withToken(savedToken);
    }

    // Build and connect
    const dbClient = builder.build();
    dbClient.connect();
    setClient(dbClient);

    return () => {
      if (dbClient) {
        dbClient.disconnect();
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