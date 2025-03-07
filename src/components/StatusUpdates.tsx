import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { safeJsonStringify, generateUniqueId, bigIntToDate, getSimpleID } from '../utils/bigint-utils';
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
      console.log('Admin Debug**********************:', identity);
      
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
          // Check token validity
          const isValidToken = (token) => {
            return token && 
                   typeof token === 'string' && 
                   token.length > 20 && 
                   !token.includes('undefined') && 
                   !token.includes('null');
          };
          console.log('Token is valid:', isValidToken(savedToken));
          
          const { DbConnection } = await import('../module_bindings');
          
          const conn = await DbConnection.builder()
            .withUri('wss://api.fractaloutlook.com')
            //.withUri('wss://64.181.202.144')
            //.withUri('wss://api.fractaloutlook.com')
            //.withUri('wss://fractaloutlook.com/') // Note: no port needed if using standard 443
            //.withUri('wss://fractaloutlook.com:3000')
            .withModuleName('status-module')
            .withToken(isValidToken(savedToken) ? savedToken : null)
            .onConnect((connectedConn, identity, token) => {
              console.log('Connected!');
              
              setConnection(connectedConn);
              localStorage.setItem('auth_token', token);
              console.log('Saved new token:', token);
              console.log('Current identity:', identity?.toHexString?.());
              setIsConnected(true);
              setStatusMessage('Connected');
              console.log('Connection details:', {
                tokenLength: token?.length,
                identityHex: identity?.toHexString?.(),
                tokenInLocalStorage: localStorage.getItem('auth_token')
              });

              connectedConn.subscriptionBuilder()
              .onApplied((ctx) => {
                console.log('Subscription applied');
                
                try {
                  const currentStatusRow = conn.db.currentStatus.id.find(0);
                  if (currentStatusRow) {
                    console.log('Found current status on load:', currentStatusRow.message);
                    setCurrentStatus({
                      id: currentStatusRow.id,
                      message: currentStatusRow.message,
                      lastUpdated: currentStatusRow.lastUpdated
                    });
                  } else {
                    console.log('No current status found in database');
                  }
                } catch (error) {
                  console.error('Error loading current status:', error);
                }

                // Check if the current user is an admin
                try {
                  const adminRecords = Array.from(connectedConn.db.admin.iter());
                  const currentIdentity = connectedConn.identity;
                  
                  const isCurrentUserAdmin = adminRecords.some(admin => 
                    admin.identity?.toHexString?.() === currentIdentity?.toHexString?.()
                  );
                  
                  console.log(`Admin check: ${isCurrentUserAdmin ? 'YES' : 'NO'} (${adminRecords.length} admins found)`);
                  //setIsAdmin(true);
                  setIsAdmin(isCurrentUserAdmin);
                } catch (error) {
                  console.error('Error checking admin status:', error);
                  setIsAdmin(false); // Default to no admin access on error
                }
                
                // Fetch updates immediately after connection
                fetchAllUpdates(connectedConn);

                //setIsAdmin(true);

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
              
              // If we get an auth error, clear the token to force a fresh login next time
              if (error.message && error.message.includes('401')) {
                console.log('Auth error detected, clearing token');
                localStorage.removeItem('auth_token');
              }
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
        <h4 className="font-medium text-gray-900 mb-2">Recent Updates:</h4>
        <p className="text-xs text-gray-500 mb-2">Found {updates.length} updates</p>
        
        {updates.length === 0 ? (
          <p className="text-gray-500 italic">No updates available</p>
        ) : (
          <div className="max-h-80 overflow-y-auto pr-2">
            <div className="space-y-2">
              {updates.map((update, index) => (
                <div
                  key={`update-${update.update_id || index}`}
                  className="py-2 px-3 bg-gray-50 rounded border border-gray-200"
                >
                  <p className="text-gray-800 font-medium">{update.message || 'Unknown message'}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      {update.timestamp 
                        ? bigIntToDate(update.timestamp).toLocaleString()
                        : 'Unknown time'}
                    </p>
                    <p className="text-xs text-gray-400">ID: {update.update_id || 'unknown'}</p>
                  </div>
                </div>
              ))}
            </div>
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

        <button
          onClick={() => {
            if (connection?.reducers?.addAdmin) {
              connection.reducers.addAdmin();
              alert('Added current user as admin - refresh the page');
            }
          }}
          className="px-4 py-2 bg-purple-200 rounded hover:bg-purple-300"
        >
          Make Admin
        </button>

      </div>
      {/* Admin Diagnostic & Management */}
        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-sm font-medium mb-2">Connection Diagnostics</h3>
          <div className="text-xs mb-2">Current Identity: {connection?.identity ? getSimpleID(connection.identity) : 'Not connected'}</div>
          <div className="text-xs mb-2">Admin Count: {connection?.db?.admin?.count() || 0}</div>
          
          <button
            onClick={() => {
              if (connection?.reducers?.addAdmin) {
                connection.reducers.addAdmin();
                alert('Added current user as admin');
                setTimeout(() => {
                  window.location.reload();
                }, 500);
              }
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Make Current Identity Admin
          </button>
        </div>
    </div>
  );
};

export default StatusUpdates;