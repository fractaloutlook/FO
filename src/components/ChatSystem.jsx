import React, { useState, useEffect } from 'react';
import { getSimpleID } from '../utils/bigint-utils';
//import connection from '../module_bindings';

const ChatSystem = ({ connection }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [oldMessage, setOldMessage] = useState('');
  const [sendStatus, setSendStatus] = useState('');

  useEffect(() => {
    console.log("Connection changed:", !!connection);
    if (connection) {
      console.log("Connection reducers:", connection.reducers);
      console.log("sendMessage reducer available:", !!connection.reducers?.sendMessage);
    }
    
    if (connection && connection.db?.message) {
      // Load existing messages
      try {
        const existingMessages = Array.from(connection.db.message.iter());
        console.log("Loaded messages:", existingMessages.length);
        setMessages(existingMessages);
        
        // Set up listener for new messages
        connection.db.message.onInsert((ctx, message) => {
          console.log("New message received:", message);
          setMessages(prev => [...prev, message]);
        });
      } catch (err) {
        console.error('Error loading messages:', err);
      }
    }
  }, [connection]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    console.log("Send button clicked, message:", newMessage);
    console.log("Send button clicked, oldMessage:", oldMessage);
    
    if(oldMessage === newMessage)
        {
            setSendStatus('Message is same as previous message');
            console.error("Same Message");
            return;
        }
    setOldMessage(newMessage);

    // Clear message input regardless of success
    const messageToSend = newMessage;
    setNewMessage('');
    
    if (!messageToSend.trim()) {
      setSendStatus('Message is empty');
      return;
    }
    

    if (!connection) {
      setSendStatus('Not connected to SpacetimeDB');
      console.error("No connection available");
      return;
    }

    
    
    try {
      // Try to use sendMessage reducer if available
      if (connection.reducers?.sendMessage) {
        console.log("Using sendMessage to send message");
        connection.reducers.sendMessage(messageToSend);
        setSendStatus('Message sent!');
      } 
      // Fallback to addUpdate if sendMessage isn't available
      /*else if (connection.reducers?.addUpdate) {
        console.log("Using addUpdate to send message (fallback)");
        connection.reducers.addUpdate(messageToSend);
        setSendStatus('Message sent via updates!');
        
        // Add to local messages for display
        const newMsg = {
          text: messageToSend,
          sender: connection.identity,
          sent: Date.now()
        };
        setMessages(prev => [...prev, newMsg]);
      }*/
      else {
        setSendStatus('No suitable reducer found');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSendStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-medium text-gray-900 mb-2">Community Chat</h3>
      
      <div className="h-64 overflow-y-auto mb-3 p-2 bg-gray-50 rounded">
        {messages.length === 0 ? (
          <p className="text-gray-500 italic">No messages yet. Be the first!</p>
        ) : (
          <div className="space-y-2">
            {messages.map((msg, index) => {
              const senderName = connection?.db?.user?.identity?.find?.(msg.sender)?.name 
                || (msg.sender ? getSimpleID(msg.sender) : 'Unknown');
              
              return (
                <div key={index} className="p-2 bg-blue-50 rounded">
                  <div className="flex items-start">
                    <span className="font-bold mr-2">{senderName}:</span>
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded"
          />
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-20"
          >
            Send
          </button>
        </div>
        
        {sendStatus && (
          <div className={`text-sm ${sendStatus.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {sendStatus}
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          Connection: {connection ? 'Active' : 'Not connected'} | 
          Reducer available: {connection?.reducers?.sendMessage ? 'Yes' : 'No'}
        </div>
      </form>
    </div>
  );
};

export default ChatSystem;