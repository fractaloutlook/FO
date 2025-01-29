import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import * as STDB from '@clockworklabs/spacetimedb-sdk';

// Define our module configuration
const REMOTE_MODULE = {
  tables: {
    current_status: {
      tableName: "current_status",
      rowType: STDB.AlgebraicType.createProductType([
        { name: "id", algebraicType: STDB.AlgebraicType.createU32Type() },
        { name: "message", algebraicType: STDB.AlgebraicType.createStringType() },
        { name: "lastUpdated", algebraicType: STDB.AlgebraicType.createU64Type() }
      ]),
      primaryKey: "id"
    }
  },
  reducers: {
    update_status: {
      reducerName: "update_status",
      argsType: STDB.AlgebraicType.createProductType([
        { name: "newStatus", algebraicType: STDB.AlgebraicType.createStringType() }
      ])
    }
  },
  eventContextConstructor: (imp, event) => {
    return {
      ...imp,
      event
    }
  },
  dbViewConstructor: (connection) => {
    return new STDB.ClientCache();
  },
  reducersConstructor: (connection) => {
    return {};
  }
};

const StatusUpdates = () => {
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');
  const [statusMessage, setStatusMessage] = useState('');
  const [client, setClient] = useState(null);

  useEffect(() => {
    const connectToDatabase = async () => {
      try {
        console.log('STDB object:', STDB);
        console.log('Initializing connection...');
        
        const connection = new STDB.DBConnectionBuilder(REMOTE_MODULE, imp => imp)
          .withUri('wss://testnet.spacetimedb.com')
          .withModuleName('status-module')
          .build();

        // Set up event handlers
        connection.on('connect', (conn, identity, token) => {
          console.log('Connected!', { identity, token });
          setConnectionStatus('Connected');
          localStorage.setItem('stdb_token', token);
          
          conn.subscriptionBuilder()
            .onApplied((ctx) => {
              console.log('Subscription applied!');
              const status = conn.db.currentStatus?.id?.find(0);
              if (status) {
                setStatusMessage(status.message);
              }
            })
            .subscribe(['SELECT * FROM current_status']);
        });

        connection.on('connectError', (conn, error) => {
          console.error('Connection error:', error);
          setConnectionStatus(`Connection error: ${error.message}`);
        });

        connection.on('disconnect', (conn, error) => {
          console.log('Disconnected', error);
          setConnectionStatus('Disconnected');
        });

        setClient(connection);
        
        // Start the connection
        connection.connect();

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