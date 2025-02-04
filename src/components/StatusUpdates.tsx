import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { DBConnection } from '../module_bindings';
import AdminControls from './AdminControls';

const StatusUpdates = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Connecting...');
  const [currentStatus, setCurrentStatus] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [connection, setConnection] = useState(null); // Store connection in state instead of ref
  
  useEffect(() => {
    const initialize = async () => {
      try {
        const conn = await DBConnection.builder()
          .withUri('ws://localhost:3000')
          .withModuleName('status-module')
          .onConnect((conn, identity, token) => {
            console.log('Connected with connection object:', conn);
            setConnection(conn); // Save connection in state
            localStorage.setItem('auth_token', token);
            setIsConnected(true);
            setStatusMessage('Connected');

            conn.subscriptionBuilder()
              .onApplied((ctx) => {
                console.log('Subscription applied, current connection:', conn);
                
                const adminStatus = conn.db.admin.identity.find(identity);
                console.log('Admin check:', { adminStatus, identity });
                setIsAdmin(!!adminStatus);
                


                const allUpdates = Array.from(conn.db.updateLog.iter())
                  .map(update => ({
                    message: update.message,
                    timestamp: update.timestamp,
                    updateId: update.updateId
                  }))
                  .sort((a, b) => Number(b.timestamp - a.timestamp));
                  
                setUpdates(allUpdates);

                'SELECT * FROM update_log',
                'SELECT * FROM admin'
              ]);
          })
          .onConnectError((_, error) => {
            console.error('Connection error:', error);
            setStatusMessage(`Connection error: ${error.message}`);
          })
          .onDisconnect(() => {
            console.log('Disconnected, clearing connection');
            setConnection(null);
            setIsConnected(false);
            setStatusMessage('Disconnected');
          })
          .build();

        // Set up table update handlers
        conn.db.currentStatus.onUpdate((_, newStatus) => {
          console.log('Status update received:', newStatus);
          setCurrentStatus({
            id: newStatus.id,
            message: newStatus.message,
            lastUpdated: newStatus.lastUpdated
          });
        });

        conn.db.updateLog.onInsert((newUpdate) => {
          console.log('New update received:', newUpdate);
          setUpdates(prev => [...prev, {
            message: newUpdate.message,
            timestamp: newUpdate.timestamp,
            updateId: newUpdate.updateId
          }].sort((a, b) => Number(b.timestamp - a.timestamp)));
        });

      } catch (error) {
        console.error('Failed to initialize connection:', error);
        setStatusMessage(`Failed to connect: ${error.message}`);
      }
    };

    initialize();
  }, []);

  // Debug log when connection or admin status changes
  useEffect(() => {
    console.log('Connection or admin status changed:', { connection, isAdmin });
  }, [connection, isAdmin]);

  return (
    <div className="space-y-4 mt-8">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle size={18} className="text-blue-500" />
          <h3 className="font-medium text-gray-900">Connection Status</h3>
        </div>
        <p className="text-gray-700">{statusMessage}</p>
        {isAdmin && (
          <p className="text-sm text-green-600 mt-2 font-medium">
            🔐 Admin access enabled
          </p>
        )}
      </div>

      {currentStatus && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-medium text-gray-900 mb-2">Current Status:</h4>
          <p className="text-gray-800">{currentStatus.message}</p>
          <p className="text-sm text-gray-600 mt-1">
            Last updated: {new Date(Number(currentStatus.lastUpdated)/1000).toLocaleString()}
          </p>
        </div>
      )}

      {updates.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-medium text-gray-900 mb-4">Recent Updates:</h4>
          <div className="space-y-3">
            {updates.map(update => (
              <div 
                key={update.updateId.toString()} 
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <p className="text-gray-800">{update.message}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(Number(update.timestamp)/1000).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Only render AdminControls if we have both admin access and a valid connection */}
      {isAdmin && connection && (
        <AdminControls connection={connection} />
      )}

      {/* Debug info */}
      <div className="text-xs text-gray-500">
        Admin: {isAdmin ? 'Yes' : 'No'} | 
        Connection: {connection ? 'Active' : 'None'}
      </div>
    </div>
  );
};

export default StatusUpdates;