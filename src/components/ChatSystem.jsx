import React, { useState, useEffect, useRef } from 'react';
import { getSimpleID } from '../utils/bigint-utils';

const ChatSystem = ({ connection }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [oldMessage, setOldMessage] = useState('');
  const [sendStatus, setSendStatus] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (connection && connection.db?.message) {
      try {
        const existingMessages = Array.from(connection.db.message.iter());
        setMessages(existingMessages);

        const unsubscribe = connection.db.message.onInsert((ctx, message) => {
          setMessages(prev => [...prev, message]);
        });
        
        return () => {
          if (typeof unsubscribe === 'function') {
            unsubscribe();
          }
        };
      } catch (err) {
        console.error('Error loading messages:', err);
      }
    }
  }, [connection]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (oldMessage === newMessage) {
      setSendStatus('Message is same as previous message');
      return;
    }
    setOldMessage(newMessage);

    const messageToSend = newMessage;
    setNewMessage('');

    if (!messageToSend.trim()) {
      setSendStatus('Message is empty');
      return;
    }

    if (!connection) {
      setSendStatus('Not connected to SpacetimeDB');
      return;
    }

    try {
      if (connection.reducers?.sendMessage) {
        connection.reducers.sendMessage(messageToSend);
        setSendStatus('Message sent!');
      } else {
        setSendStatus('No suitable reducer found');
      }
    } catch (error) {
      setSendStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Option 1: Center header */}
      <h3 className="text-center font-medium text-gray-900 mb-2">C?</h3>
      {/* Option 2: Remove header entirely */}
      {/* <h3 className="sr-only">C?</h3> */}
      
      <div className="h-64 overflow-y-auto mb-3 p-2 bg-gray-50 rounded">
        {messages.length === 0 ? (
          <p className="text-gray-500 italic text-sm">--- missing record ---</p>
        ) : (
          <div className="space-y-2">
            {messages.map((msg, index) => {
              const senderName = connection?.db?.user?.identity?.find?.(msg.sender)?.name
                || (msg.sender ? getSimpleID(msg.sender) : 'Unknown');
              return (
                <div key={index} className="p-2 bg-blue-50 rounded">
                  <div className="flex items-start">
                    <span className="font-bold mr-2 text-sm">{senderName}:</span>
                    <span className="text-sm">{msg.text}</span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
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
            className="flex-1 p-2 border rounded text-sm"
          />
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-20 text-sm"
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
