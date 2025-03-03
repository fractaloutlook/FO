import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { safeJsonStringify, generateUniqueId, bigIntToDate } from '../utils/bigint-utils';
import AdminControls from './AdminControls';

const StatusUpdates = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Connecting...');
  const [currentStatus, setCurrentStatus] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [connection, setConnection] = useState(null);
  const initialized = useRef(false);

  // Log updates state changes for debugging
  useEffect(() => {
    console.log(`Updates state now has ${updates.length} items:`, 
      updates.map(u => ({ message: u.message, id: u.update_id })));
  }, [updates]);

  // Debug method for admin table
  React.useEffect(() => {
    window.debugAdmin = () => {
      if (!connection) {
        console.log('No connection available');
        return;
      }
      
      const adminTableEntries = Array.from(connection.db.admin.iter());
      const identity = connection.identity;
      
      try {
        console.log('Admin Debug:', {
          connection: !!connection,
          identity: identity?.toHexString?.(),
          adminCount: connection.db.admin.count(),
          adminEntries: adminTableEntries.map(a => ({
            identityHex: a.identity?.toHexString?.(),
            isMatch: a.identity?.toHexString?.() === identity?.toHexString?.()
          }))
        });
      } catch (error) {
        console.log('Error in debugAdmin:', error);
      }
    };
    
    return () => {
      delete window.debugAdmin;
    };
  }, [connection]);

  // Simple fetch all updates function
  const fetchAllUpdates = (conn) => {
    if (!conn || !conn.db || !conn.db.updateLog) return;
    
    try {
      const rawUpdates = Array.from(conn.db.updateLog.iter());
      console.log(`Database contains ${rawUpdates.length} updates`);
      
      // Extract the raw updates
      const processedUpdates = rawUpdates.map((update, index) => {
        // Get properties using whatever name they might have
        const message = update.message || "Unknown";
        const timestamp = update.timestamp || Date.now() * 1000;
        const update_id = update.updateId || index;
        
        return { message, timestamp, update_id };
      });
      
      // Sort by timestamp, newest first
      processedUpdates.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
      
      console.log(`Processed ${processedUpdates.length} updates`);
      
      // Update state with ALL updates at once
      setUpdates(processedUpdates);
    } catch (error) {
      console.error("Error fetching updates:", error);
    }
  };

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const initializeConnection = async () => {
        try {
          const savedToken = localStorage.getItem('auth_token');
          console.log('Using saved token:', savedToken);
          
          const isValidToken = (token) => token && typeof token === 'string' && token.length > 20;
          
          const { DbConnection } = await import('../module_bindings');
          
          const conn = await DbConnection.builder()
            .withUri('ws://localhost:3000')
            .withModuleName('status-module')
            .withToken(isValidToken(savedToken) ? savedToken : null)
            .onConnect((connectedConn, identity, token) => {
              console.log('Connected!');
              
              setConnection(connectedConn);
              localStorage.setItem('auth_token', token);
              setIsConnected(true);
              setStatusMessage('Connected');
              
              connectedConn.subscriptionBuilder()
              .onApplied((ctx) => {
                console.log('Subscription applied');
                
                // Set admin status - just use override for now
                setIsAdmin(true);
                
                // Fetch updates immediately after connection
                fetchAllUpdates(connectedConn);
              })
              .subscribe([
                'SELECT * FROM admin', 
                'SELECT * FROM update_log',
                'SELECT * FROM current_status'
              ]);
            })
            .onConnectError((_, error) => {
              console.error('Connection error:', error);
              setStatusMessage(`Connection error: ${error.message}`);
            })
            .onDisconnect(() => {
              console.log('Disconnected');
              setConnection(null);
              setIsConnected(false);
              setStatusMessage('Disconnected');
            })
            .build();
            
          // Handle status updates
          conn.db.currentStatus.onUpdate((ctx, _, newStatus) => {
            console.log('Status update received:', newStatus.message);
            setCurrentStatus({
              id: newStatus.id,
              message: newStatus.message,
              lastUpdated: newStatus.lastUpdated,
            });
          });
          
          // Handle new updates being added
          conn.db.updateLog.onInsert((ctx, newUpdate) => {
            console.log('New update received:', newUpdate.message);
            
            // Instead of modifying state directly, refresh all updates
            // This ensures we always have a complete set
            fetchAllUpdates(conn);
          });
          
        } catch (error) {
          console.error('Failed to initialize connection:', error);
          setStatusMessage(`Failed to connect: ${error.message}`);
        }
      };
      
      initializeConnection();
    }
  }, []);

  return (
    <div className="space-y-4 mt-8">
      {/* Connection Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle size={18} className="text-blue-500" />
          <h3 className="font-medium text-gray-900">Connection Status</h3>
        </div>
        <p className="text-gray-700">{statusMessage}</p>
        {isAdmin && (
          <p className="text-sm text-green-600 mt-2 font-medium">🔐 Admin access enabled</p>
        )}
      </div>

      {/* Current Status */}
      {currentStatus && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-medium text-gray-900 mb-2">Current Status:</h4>
          <p className="text-gray-800">{currentStatus.message}</p>
          <p className="text-sm text-gray-600 mt-1">
            Last updated: {bigIntToDate(currentStatus.lastUpdated).toLocaleString()}
          </p>
        </div>
      )}

      {/* Updates from Database */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-medium text-gray-900 mb-4">Recent Updates:</h4>
        <p className="text-xs text-gray-500 mb-2">Found {updates.length} updates</p>
        
        {updates.length === 0 ? (
          <p className="text-gray-500 italic">No updates available</p>
        ) : (
          <div className="space-y-3">
            {updates.map((update, index) => (
              <div
                key={`update-${update.update_id || index}`}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <p className="text-gray-800">{update.message || 'Unknown message'}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {update.timestamp 
                    ? bigIntToDate(update.timestamp).toLocaleString()
                    : 'Unknown time'}
                </p>
                <p className="text-xs text-gray-400 mt-1">ID: {update.update_id || 'unknown'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hardcoded Updates */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-medium text-gray-900 mb-4">Recent Updates by hand:</h4>
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-800">Putting STDB module onto testnet</p>
            <p className="text-sm text-gray-500 mt-1">Just now</p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-800">Working on updates functionality and automation</p>
            <p className="text-sm text-gray-500 mt-1">03-02-2025</p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-800">Small medical derailment - fighting with nature</p>
            <p className="text-sm text-gray-500 mt-1">The whole month of February</p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-800">My updates section below is still rather broken, so I'll put one here. While I'm not sure *exactly* what this is, I can say that as of today, it's an MMO. So. Welcome to that, I guess!</p>
            <p className="text-sm text-gray-500 mt-1">02-04-2025</p>
          </div>
        </div>
      </div>
      
      {/* Admin Controls */}
      {isAdmin && connection && (
        <AdminControls connection={connection} />
      )}

      {/* Status Info */}
      <div className="text-xs text-gray-500">
        Admin: {isAdmin ? 'Yes' : 'No'} | Connection: {connection ? 'Active' : 'None'}
      </div>
      
      {/* Debug Buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => fetchAllUpdates(connection)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Refresh Updates
        </button>
        
        <button
          onClick={() => {
            if (connection) {
              try {
                console.log('Database debug:');
                console.log('- Update count:', connection.db.updateLog.count());

                const dbUpdates = Array.from(connection.db.updateLog.iter());
                console.log('- Raw updates:', dbUpdates.length);
                dbUpdates.forEach((update, i) => {
                  console.log(`  Update #${i}:`, 
                    update.message || 'no message',
                    update.updateId || 'no ID');
                });
                
                alert(`Found ${dbUpdates.length} updates in database`);
              } catch (error) {
                console.error('Error in debug:', error);
              }
            }
          }}
          className="px-4 py-2 bg-blue-200 rounded hover:bg-blue-300"
        >
          Debug
        </button>
      </div>
    </div>
  );
};

export default StatusUpdates;