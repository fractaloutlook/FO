import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Client as SpacetimeDBClient } from '@clockworklabs/spacetimedb-sdk';

// Import our generated types
import { CurrentStatus } from '../module_bindings/current_status_table';
import { UpdateLog } from '../module_bindings/update_log_table';
import { Admin } from '../module_bindings/admin_table';

// Register our tables with SpaceTimeDB
SpacetimeDBClient.registerTables(CurrentStatus, UpdateLog, Admin);

const StatusUpdates = () => {
  const [client, setClient] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('');
  const [updates, setUpdates] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Create and configure the client
    const dbClient = new SpacetimeDBClient('ws://localhost:3000', 'status-module');

    // Set up event handlers
    dbClient.on('connect', (token, identity) => {
      console.log('Connected to SpaceTimeDB');
      localStorage.setItem('stdb_token', token);
      
      // Subscribe to all our tables
      dbClient.subscribe(['SELECT * FROM current_status', 'SELECT * FROM update_log', 'SELECT * FROM admin']);
    });

    dbClient.on('subscribed', () => {
      console.log('Subscription complete');
      
      // Get initial data
      const status = CurrentStatus.findById(0);
      if (status) setCurrentStatus(status.message);

      // Get update log, sort by timestamp descending
      const updateLog = Array.from(UpdateLog.all())
        .sort((a, b) => b.timestamp - a.timestamp);
      setUpdates(updateLog);
    });

    // Connect to the database
    dbClient.connect();
    setClient(dbClient);

    return () => {
      if (dbClient) {
        dbClient.disconnect();
      }
    };
  }, []);

  // Set up table update handlers
  useEffect(() => {
    if (!client) return;

    CurrentStatus.onUpdate((oldValue, newValue) => {
      setCurrentStatus(newValue.message);
    });

    UpdateLog.onInsert((newUpdate) => {
      setUpdates(prev => [newUpdate, ...prev].sort((a, b) => b.timestamp - a.timestamp));
    });

  }, [client]);

  return (
    <div className="space-y-4 mt-8">
      {/* Current Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle size={18} className="text-blue-500" />
          <h3 className="font-medium text-gray-900">Current Status:</h3>
        </div>
        <p className="text-gray-700">{currentStatus || "No current status"}</p>
      </div>

      {/* Updates Log */}
      <div className="bg-gray-50 rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Recent Updates</h3>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          <div className="space-y-2 p-4">
            {updates.map((update, index) => (
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
    </div>
  );
};

export default StatusUpdates;