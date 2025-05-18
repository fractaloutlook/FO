import React, { useState } from 'react';
import { Pencil, Send } from 'lucide-react';
import { safeJsonStringify } from '../utils/bigint-utils';

const AdminControls = ({ connection }) => {
  const [newStatus, setNewStatus] = useState('');
  const [newUpdate, setNewUpdate] = useState('');
  const [actionFeedback, setActionFeedback] = useState('');

  const handleStatusUpdate = (e) => {
    e.preventDefault();
    if (!newStatus.trim() || !connection) return;
    
    try {
      console.log('Sending status update:', newStatus);
      console.log('Connection object:', connection ? 'Connected' : 'Not connected');
      
      if (connection.reducers && connection.reducers.updateStatus) {
        connection.reducers.updateStatus(newStatus);
        setNewStatus('');
        setActionFeedback('Status update sent!');
        
        // Clear feedback message after 3 seconds
        setTimeout(() => setActionFeedback(''), 3000);
      } else {
        console.error('updateStatus reducer not available');
        setActionFeedback('Error: Update method not available');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setActionFeedback(`Error: ${error.message}`);
    }
  };

  const handleAddUpdate = (e) => {
    e.preventDefault();
    if (!newUpdate.trim() || !connection) {
      console.log("Cannot add update:", {
        newUpdateEmpty: !newUpdate.trim(),
        connectionMissing: !connection
      });
      return;
    }
    
    try {
      console.log('Adding update:', {
        text: newUpdate,
        connection: !!connection,
        reducersAvailable: connection ? !!connection.reducers : false
      });
      
      if (connection.reducers && connection.reducers.addUpdate) {
        connection.reducers.addUpdate(newUpdate);
        setNewUpdate('');
        setActionFeedback('Update added!');
        
        // Clear feedback message after 3 seconds
        setTimeout(() => setActionFeedback(''), 3000);
      } else {
        console.error('addUpdate reducer not available');
        setActionFeedback('Error: Update method not available');
      }
    } catch (error) {
      console.error('Error adding update:', error);
      setActionFeedback(`Error: ${error.message}`);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Controls</h3>
      
      {actionFeedback && (
        <div className={`p-2 mb-4 rounded ${actionFeedback.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {actionFeedback}
        </div>
      )}
      
      {/* Status Update Form */}
      <form onSubmit={handleStatusUpdate} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            placeholder="Update current status..."
            className="flex-1 rounded-md border border-gray-300 p-2"
          />
          <button 
            type="submit"
            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            disabled={!connection || !newStatus.trim()}
          >
            <Pencil size={20} />
          </button>
        </div>
      </form>

      {/* Add Update Form */}
      <form onSubmit={handleAddUpdate}>
        <div className="flex gap-2">
          <input
            type="text"
            value={newUpdate}
            onChange={(e) => setNewUpdate(e.target.value)}
            placeholder="Add new update..."
            className="flex-1 rounded-md border border-gray-300 p-2"
          />
          <button 
            type="submit"
            className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300"
            disabled={!connection || !newUpdate.trim()}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
      {/* Admin Management Section */}
      {/*}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium mb-2">Admin Management</h4>
          <button 
            onClick={() => {
              if (connection?.reducers?.addAdmin) {
                connection.reducers.addAdmin();
                setActionFeedback('Added current user as admin');
                setTimeout(() => setActionFeedback(''), 3000);
              }
            }}
            className="w-full py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-purple-300"
            disabled={!connection}
          >
            Make Current User Admin
          </button>
        </div> */}
    </div>
  );
};

export default AdminControls;