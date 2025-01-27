import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import * as STDB from '@clockworklabs/spacetimedb-sdk';
import { DBConnection } from '@clockworklabs/spacetimedb-sdk';

// Import our generated table types
import { CurrentStatusTableHandle } from '../module_bindings/current_status_table';
import { UpdateLogTableHandle } from '../module_bindings/update_log_table';
import { AdminTableHandle } from '../module_bindings/admin_table';

const StatusUpdates = () => {
  const [client, setClient] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('');
  const [updates, setUpdates] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');

  useEffect(() => {
    console.log('Initializing SpaceTimeDB connection...');
    
    const builder = STDB.DBConnectionBuilder()
      .withAddress('wss://testnet.spacetimedb.com')
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
      .onSubscriptionApplied(() => {
        console.log('Subscription applied!');
        const dbClient = client;
        if (dbClient) {
          // Get current status
          const currentStatusTable = dbClient.db.currentStatus;
          const statusRows = Array.from(currentStatusTable.iter());
          if (statusRows.length > 0) {
            setCurrentStatus(statusRows[0].message);
          }

          // Get update log
          const updateLogTable = dbClient.db.updateLog;
          const updateRows = Array.from(updateLogTable.iter())
            .sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
          setUpdates(updateRows);
        }
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
    
    // Subscribe to our tables
    dbClient.SubscriptionBuilder()
      .onApplied(() => {
        console.log('Subscription applied');
      })
      .subscribe(['SELECT * FROM current_status', 'SELECT * FROM update_log']);
    
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
      {/* Current Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle size={18} className="text-blue-500" />
          <h3 className="font-medium text-gray-900">Current Status:</h3>
        </div>
        <p className="text-gray-700">{connectionStatus}</p>
        {currentStatus && (
          <p className="text-gray-700 mt-2">{currentStatus}</p>
        )}
      </div>

      {/* Updates Log */}
      {updates.length > 0 && (
        <div className="bg-gray-50 rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Recent Updates</h3>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            <div className="space-y-2 p-4">
              {updates.map((update) => (
                <div key={update.update_id} className="text-sm">
                  <span className="text-gray-500">
                    {new Date(Number(update.timestamp)).toLocaleString()}:
                  </span>
                  <span className="text-gray-700 ml-2">{update.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusUpdates;