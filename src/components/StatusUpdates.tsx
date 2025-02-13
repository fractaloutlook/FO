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
            console.log('Connected with connection object:', connectedConn);
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
            .onApplied(() => {
                console.log('Subscription applied');
            
              // NEW: Add these three lines for admin table debugging
              const adminCount = connectedConn.db.admin.count();
              console.log('Admin table check:', {
                  adminCount,
                  admins: Array.from(connectedConn.db.admin.iter()),
                  currentIdentity: identity
              });
                      
                const adminStatus = connectedConn.db.admin.identity.find(identity);
                // Enhance this existing log with more details
                console.log('Admin check:', {
                    adminStatus,
                    identity,
                    adminTableCount: connectedConn.db.admin.count(),
                    identityHex: identity?.toHexString?.()
                });
                setIsAdmin(!!adminStatus);
            
                const fetchedUpdates = Array.from(connectedConn.db.updateLog.iter())
                    .map(update => ({
                        message: update.message,
                        timestamp: update.timestamp,
                        updateId: update.updateId,
                    }))
                    .sort((a, b) => Number(b.timestamp - a.timestamp));
            
                setUpdates(fetchedUpdates);
            });

            connectedConn.subscribe('SELECT * FROM admin');

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

            

        conn.db.currentStatus.onUpdate((_, newStatus) => {
          console.log('Status update received:', newStatus);
          setCurrentStatus({
            id: newStatus.id,
            message: newStatus.message,
            lastUpdated: newStatus.lastUpdated,
          });
                        // NEW: Add these three lines for admin table debugging
                        const adminCount = connectedConn.db.admin.count();
                        console.log('Admin table check:', {
                            adminCount,
                            admins: Array.from(connectedConn.db.admin.iter()),
                            currentIdentity: identity
                        });
        });

        conn.db.updateLog.onInsert(newUpdate => {
          console.log('New update received:', newUpdate);
          setUpdates(prev => [
            ...prev,
            {
              message: newUpdate.message,
              timestamp: newUpdate.timestamp,
              updateId: newUpdate.updateId,
            },
          ].sort((a, b) => Number(b.timestamp - a.timestamp)));
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
            {updates.map(update => (
              <div
                key={update.updateId.toString()}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <p className="text-gray-800">{update.message}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(Number(update.timestamp) / 1000).toLocaleString()}
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
    </div>
  );
};

export default StatusUpdates;
