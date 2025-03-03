import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { AdminTableHandle, DBConnection } from '../module_bindings';
import AdminControls from './AdminControls';

const StatusUpdates = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Connecting...');
  const [currentStatus, setCurrentStatus] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [connection, setConnection] = useState(null);
  const initialized = useRef(false); 

    // 3.7's new useEffect block for debugging admin table //////////////////////////
    React.useEffect(() => {
      // Expose a debug method to the global window object
      window.debugAdmin = () => {
        if (!connection) {
          console.log('No connection available');
          return;
        }
        
        const adminTableEntries = Array.from(connection.db.admin.iter());
        const identity = connection.identity;
        
        console.log('Admin Debug:', {
          connection: !!connection,
          identity: identity?.toHexString?.(),
          adminCount: connection.db.admin.count(),
          adminEntries: adminTableEntries.map(a => ({
            identityHex: a.identity?.toHexString?.(),
            isMatch: a.identity?.toHexString?.() === identity?.toHexString?.()
          }))
        });
      };
      
      return () => {
        delete window.debugAdmin;
      };
    }, [connection]);

    ////////////////////////// end of new useEffect block for debugging admin table

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const initializeConnection = async () => {
      try {

        const savedToken = localStorage.getItem('auth_token');
        console.log('Raw saved token:', savedToken);
        
        const isValidToken = (token) => token && typeof token === 'string' && token.length > 20;


        console.log('Using saved token:', savedToken);   
        const conn = await DBConnection.builder()
          .withUri('ws://localhost:3000')
          .withModuleName('status-module')
          .withCredentials([null, isValidToken(savedToken) ? savedToken : null])
          .onConnect((connectedConn, identity, token) => {
            console.log('Connected with connection object 1:', connectedConn);
            ///
//             if (isValidToken(token)) {
//               console.log('Using valid token:', token);
//               //localStorage.setItem('auth_token', token);
// ``          } else {
//               console.log('Received invalid token:', soken);
//               localStorage.removeItem('auth_token');
//           ``}``
            ///
            setConnection(connectedConn);
            localStorage.setItem('auth_token', token);
            setIsConnected(true);
            setStatusMessage('Connected 1');
            console.log('New connection details:', {
              token,
              identityData: identity?.toUint8Array(),
              identityHex: identity?.toHexString()
            });
            
  
            connectedConn.subscriptionBuilder()
            .onApplied((ctx) => {
              console.log('Subscription applied --------------------------------');
              console.log('onConnect subscription applied');

              // Reload admin status explicitly on subscription applied
              const identity = connectedConn.identity;
              const adminTableEntries = Array.from(conn.db.admin.iter());
              const identityHex = identity?.toHexString?.();
              
              // Log all available information for debugging
              console.log('Revalidating admin on subscription:', {
                identity,
                identityHex,
                adminCount: connectedConn.db.admin.count(),
                adminEntries: adminTableEntries.map(a => a.identity?.toHexString?.())
              });
              
              // Try both methods
              const adminStatus = connectedConn.db.admin?.identity?.find ? 
                   connectedConn.db.admin.identity.find(identity) : undefined;
              const manualMatch = adminTableEntries.some(admin => 
                    admin.identity && identity && 
                    admin.identity?.toHexString?.() === identityHex);
              
              console.log('Admin match results:', { adminStatus, manualMatch });

              setIsAdmin(!!adminStatus || manualMatch);

              // Add this to your debugging code
console.log('Identity comparison:', {
  currentIdDecimal: identity?.toUint8Array ? Array.from(identity.toUint8Array()) : 'unknown',
  adminEntriesDecimal: adminTableEntries.map(admin => 
    admin.identity?.toUint8Array ? Array.from(admin.identity.toUint8Array()) : 'unknown'
  ),
  sqlEntries: [
    '87750156875127036908901665596203429061340017254934419099381395459532602755426',
    '87750269751448402144363327785474093733782240338747509602264477582796839799289'
  ]
});
// Add this to your debugging
const knownAdmins = [
  '87750156875127036908901665596203429061340017254934419099381395459532602755426',
  '87750269751448402144363327785474093733782240338747509602264477582796839799289'
];

// Try to convert your identity to decimal format for comparison
const currentIdDecimal = identity ? BigInt('0x' + identity.toHexString()).toString() : 'unknown';

const directMatch = knownAdmins.includes(currentIdDecimal);
console.log('Direct identity comparison:', {
  currentIdDecimal,
  directMatch
});

// Force admin status if we get a direct match
if (directMatch) {
  setIsAdmin(true);
}

              // Force admin status temporarily for debugging
console.log("OVERRIDE: Setting admin status to true for debugging");
setIsAdmin(true);
              
              // Original code for updates
              // const fetchedUpdates = Array.from(connectedConn.db.updateLog.iter())
              //   .map(update => ({
              //     message: update.message,
              //     timestamp: update.timestamp,
              //     update_id: update.update_id,
              //   }))
              //   .sort((a, b) => Number(b.timestamp - a.timestamp));
              
              // setUpdates(fetchedUpdates);
              ////////////////////////////
              // Inside your onApplied callback where you fetch initial updates
console.log('Raw update log entries:', Array.from(connectedConn.db.updateLog.iter())
.map(update => JSON.stringify(update, null, 2)));

const fetchedUpdates = Array.from(connectedConn.db.updateLog.iter())
.map(update => {
  console.log('Processing update:', update);
  // Check for possible property name variations
  return {
    message: update.message || update.text,
    timestamp: update.timestamp || update.sent || Date.now() * 1000,
    update_id: update.update_id || update.id || `temp-${Date.now()}`
  };
})
.sort((a, b) => Number(b.timestamp - a.timestamp));

console.log('Processed updates:', fetchedUpdates);
setUpdates(fetchedUpdates);
              ///////////////////////////////
            })
            .subscribe([
              'SELECT * FROM admin', 
              'SELECT * FROM update_log', // Explicitly order
              'SELECT * FROM current_status'
            ]);

            console.log("Subscribed to admin, update_log, and current_status tables");
  

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

          // Update the UI with the current status
          conn.db.currentStatus.onUpdate((ctx, _, newStatus) => {
            console.log('Status update received:', {
              newStatusMessage: newStatus.message,
              timestamp: newStatus.lastUpdated
            });
            
            // Force a fresh state update
            setCurrentStatus({
              id: newStatus.id,
              message: newStatus.message,
              lastUpdated: newStatus.lastUpdated,
            });

            // NEW: Add these three lines for admin table debugging
            const adminCount = conn.db.admin.count();
            console.log('Admin table check:', {
                adminCount,
                admins: Array.from(conn.db.admin.iter()),
                currentIdentity: conn.identity
            });

          });

          conn.db.updateLog.onInsert(newUpdate => {
            console.log('New update received:', newUpdate);
            try {
              // Make sure all required fields exist before adding to state
              if (newUpdate) {
                // Simple, robust update formatting
                const formattedUpdate = {
                  message: newUpdate.message || "Unknown message",
                  timestamp: newUpdate.timestamp || Date.now() * 1000,
                  update_id: newUpdate.update_id || `temp-${Date.now()}`
                };
                
                setUpdates(prev => [
                  formattedUpdate,
                  ...prev
                ].sort((a, b) => Number(b.timestamp - a.timestamp)));
              } else {
                console.warn('Received empty update object');
              }
            } catch (error) {
              console.error('Error processing new update:', error);
            }
          });
        
        // Teardown routine on component unmount
        return () => {
          conn.close(); // Close the connection
          setCurrentStatus(null); // Reset current status
          setUpdates([]); // Clear updates
        };
      } catch (error) {
        console.error('Failed to initialize connection:', error);
        setStatusMessage(`Failed to connect: ${error.message}`);
      }
    };
    console.log('Initializing connection... right before running it');
    initializeConnection();

    
  }
    
  }, []);

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
          <p className="text-sm text-green-600 mt-2 font-medium">🔐 Admin access enabled</p>
        )}
      </div>

      {currentStatus && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-medium text-gray-900 mb-2">Current Status:</h4>
          <p className="text-gray-800">{currentStatus.message}</p>
          <p className="text-sm text-gray-600 mt-1">
            Last updated: {new Date(Number(currentStatus.lastUpdated) / 1000).toLocaleString()}
          </p>
        </div>
      )}

      {updates.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-medium text-gray-900 mb-4">Recent Updates:</h4>
          <div className="space-y-3">
          {updates.map((update, index) => (
            <div
              key={update.update_id?.toString() || `update-${index}`}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <p className="text-gray-800">{update.message || 'No message'}</p>
              <p className="text-sm text-gray-500 mt-1">
                {update.timestamp 
                  ? new Date(Number(update.timestamp) / 1000).toLocaleString() 
                  : 'Just now'}
              </p>
            </div>
          ))}
          </div>
        </div>
      )}

      {isAdmin && connection && (
        <AdminControls connection={connection} />
      )}

      <div className="text-xs text-gray-500">
        Admin: {isAdmin ? 'Yes' : 'No'} | Connection: {connection ? 'Active' : 'None'}
      </div>
      // Add this near the bottom of your StatusUpdates component
<div className="mt-4">
  <button
    onClick={() => {
      if (connection) {
        console.log('Manual refresh of updates');
        const manualFetchedUpdates = Array.from(connection.db.updateLog.iter())
          .map(update => ({
            message: update.message || "Unknown message",
            timestamp: update.timestamp || Date.now() * 1000,
            update_id: update.update_id || `manual-${Date.now()}`
          }))
          .sort((a, b) => Number(b.timestamp - a.timestamp));
        
        console.log('Manually fetched updates:', manualFetchedUpdates);
        setUpdates(manualFetchedUpdates);
      }
    }}
    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
  >
    Refresh Updates
  </button>
</div>
    </div>
    
  );
};

export default StatusUpdates;