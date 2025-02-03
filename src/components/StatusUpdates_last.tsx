import React, { useState, useEffect, useRef} from 'react';
import { AlertCircle } from 'lucide-react';
import { DBConnection } from '../module_bindings';
//import { DbConnection, type RemoteDBContext } from '../module_bindings';

import { DBConnectionBuilder, Identity } from '@clockworklabs/spacetimedb-sdk';

export type MessageType = {
  name: string;
  message: string;
};

////////// status message types //////////

// Types for our status data
type StatusUpdate = {
  message: string;
  timestamp: bigint;
  updateId: bigint;
};
type CurrentStatusType = {
  id: number;
  message: string;
  lastUpdated: bigint;
};

// declare these outside the component to avoid re-creating them on each render

const token = localStorage.getItem('auth_token') || undefined;
const identity = localStorage.getItem('identity') || undefined;

const StatusUpdates = () => {
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');
  const [statusMessage, setStatusMessage] = useState('');
  const [setConn] = useState(null);
  const hasConnected = useRef(false);

  ///////// example App.tsx consts //////////
  const [newName, setNewName] = useState('');
  const [settingName, setSettingName] = useState(false);
  const [name, setName] = useState('');

  // Store all system messages as a Set, to avoid duplication
  const [systemMessages, setSystemMessages] = useState(
    () => new Set<string>([])
  );
  const [messages, setMessages] = useState<MessageType[]>([]);

  const [newMessage, setNewMessage] = useState('');

  const local_identity = useRef<Identity | undefined>(undefined);
  const initialized = useRef<boolean>(false);
  const conn = useRef<RemoteDBContext>(null!);

  ///////////////////////////////////////////

  // our status message and updates objects

  const [currentStatus, setCurrentStatus] = useState<CurrentStatusType | null>(null);
  const [updates, setUpdates] = useState<StatusUpdate[]>([]);



  //////// example App.tsx first useEffect //////////

  useEffect(() => {
    async function main() {
      if(initialized.current) return; //// stop it from running twice
        initialized.current = true;
      if (!conn.current) {
        conn.current = await DBConnection.builder()
          .withUri('ws://localhost:3000')
          .withModuleName('status-module')
          //.withCredentials(token)
          .onDisconnect(() => {
            console.log('disconnected');
          })
          .onConnectError(() => {
            console.log('client_error');
          })
          .onConnect((identity, token) => {
            console.log('Connected to SpacetimeDB');
            console.log('Identity object:', identity); // Log the identity object
            console.log('Token:', identity.token); // Log the token
            // Check if we're admin
            const isAdmin = conn.current.db.admin.identity.find(local_identity.current);
            console.log("Admin status:", !!isAdmin);
            localStorage.setItem('auth_token', token);
            localStorage.setItem('identity', identity/*.toHexString()*/); // tohexstring not defined here

            conn.current!.subscriptionBuilder()
            .onApplied((ctx) => {
              console.log("Initial subscription applied");
              setStatusMessage("Connected and subscribed to updates");
            })
            .subscribe([
              'SELECT * FROM current_status',
              'SELECT * FROM update_log'
            ]);
          })
          .build();
      }
    }

    main();
  }, []);

/////////////// end of first app.tsx useEffect /////////////////////////////

//// example App.tsx second useEffect //////////

  // All the event listeners are set up in the useEffect hook
  useEffect(() => {
    if (!conn.current) return;

    // TODO: What do about this?
    // conn.on('initialStateSync', () => {
    //   setAllMessagesInOrder();
    //   const user = User.findByIdentity(local_identity?.current!);
    //   setName(userNameOrIdentity(user!));
    // });

    conn.current.db.user.onInsert(user => {
      if (user.online) {
        appendToSystemMessage(`${userNameOrIdentity(user)} has connected.`);
      }
    });

    conn.current.db.user.onUpdate((oldUser, user) => {
      if (oldUser.online === false && user.online === true) {
        appendToSystemMessage(`${userNameOrIdentity(user)} has connected.`);
      } else if (oldUser.online === true && user.online === false) {
        appendToSystemMessage(`${userNameOrIdentity(user)} has disconnected.`);
      }

      if (user.name !== oldUser.name) {
        appendToSystemMessage(
          `User ${userNameOrIdentity(oldUser)} renamed to ${userNameOrIdentity(
            user
          )}.`
        );
      }
    });

    conn.current.db.message.onInsert(() => {
      setAllMessagesInOrder();
    });

    conn.current.reducers.onSendMessage((ctx, text) => {
      if (
        local_identity.current &&
        ctx.event.callerIdentity.isEqual(local_identity.current)
      ) {
        if (reducerEvent.status === 'failed') {
          appendToSystemMessage(
            `Error sending message: ${reducerEvent.message} `
          );
        }
      }
    });

    // Listen for current status changes
    conn.current.db.currentStatus.onInsert((newStatus) => {
      console.log("Received current status:", newStatus);
      setCurrentStatus({
        id: newStatus.id,
        message: newStatus.message,
        lastUpdated: newStatus.lastUpdated
      });
    });

    // Listen for new updates added
    conn.current.db.updateLog.onInsert((update) => {
      console.log("Received update:", update);
      setUpdates(prev => [...prev, {
        message: update.message,
        timestamp: update.timestamp,
        updateId: update.updateId
      }].sort((a, b) => Number(b.timestamp - a.timestamp)));
    });

    SetNameReducer.on((reducerEvent, reducerArgs) => {
      if (
        local_identity.current &&
        reducerEvent.callerIdentity.isEqual(local_identity.current)
      ) {
        if (reducerEvent.status === 'failed') {
          appendToSystemMessage(`Error setting name: ${reducerEvent.message} `);
        } else if (reducerEvent.status === 'committed') {
          setName(reducerArgs[0]);
        }
      }
    });
  }, []);

  /////////////// end of second useEffect /////////////////////////////

  //// new useEffect for status updates ////
  useEffect(() => {
    if (!conn.current) return;
    
    // Listen for current status changes
    conn.current.db.currentStatus.onUpdate((_, newStatus) => {
      setCurrentStatus({
        id: newStatus.id,
        message: newStatus.message,
        lastUpdated: newStatus.lastUpdated
      });
    });
  
    // Listen for current status inserts
    conn.current.db.currentStatus.onInsert((newStatus) => {
      setCurrentStatus({
        id: newStatus.id,
        message: newStatus.message,
        lastUpdated: newStatus.lastUpdated
      });
    });
  
    // Listen for new updates
    conn.current.db.updateLog.onInsert((update) => {
      setUpdates(prev => [...prev, {
        message: update.message,
        timestamp: update.timestamp,
        updateId: update.updateId
      }].sort((a, b) => Number(b.timestamp - a.timestamp)));
    });
  }, []);

  /////// end of new useEffect for status updates //////

/* old useEffect 
  useEffect(() => {
    
    if (hasConnected.current) return;
    hasConnected.current = true;
    
    if (localStorage.getItem('stdbToken')
      && localStorage.getItem('stdbToken').length > 0) {
      console.log('Connecting to SpacetimeDB with token...');
    } else {
      console.log('Connecting to SpacetimeDB with no token...');
    }

    setConn(DBConnection.builder()
      .withUri('ws://localhost:3000')  // Changed to http for initial connection
      .withModuleName('status-module')
      .withCredentials(localStorage.getItem('stdbToken') || null)
      .onConnect((conn, identity, stdbToken) => {
        localStorage.setItem('stdbToken', stdbToken);
        console.log('Connected!', { identity: identity.toHexString(), stdbToken });
        setConnectionStatus('Connected');
        setStatusMessage('Initializing client cache...');

        conn.subscriptionBuilder()
          .onApplied(() => {
            console.log("SDK client cache initialized.");
            setStatusMessage("Client cache initialized");
          })
          .subscribe(['SELECT * FROM current_status']);
        

      })
      .onDisconnect(() => {
        console.log("Disconnected from SpacetimeDB");
        setConnectionStatus('Disconnected');
      })
      .onConnectError((_, err) => {
        console.error("Connection error:", err);
        setConnectionStatus(`Connection error: ${err.message}`);
      })
      .build()
    );

    return () => {
      if (conn) {
        conn.disconnect();
      }
    };
  }, []);

  */ // end old useEffect

  return (
    <div className="space-y-4 mt-8">
      {/* Connection Status Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle size={18} className="text-blue-500" />
          <h3 className="font-medium text-gray-900">Connection Status:</h3>
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
  
      {/* Current Status Card */}
      {currentStatus && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-medium text-blue-900 mb-2">Current Status:</h4>
          <p className="text-blue-800">{currentStatus.message}</p>
          <p className="text-sm text-blue-600 mt-1">
            Last updated: {new Date(Number(currentStatus.lastUpdated) / 1000).toLocaleString()}
          </p>
        </div>
      )}
  
      {/* Updates List */}
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
    </div>
  );
};

export default StatusUpdates;