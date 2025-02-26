import React, { useState } from 'react';
import { Pencil, Send } from 'lucide-react';

const AdminControls = ({ connection }) => {
  const [newStatus, setNewStatus] = useState('');
  const [newUpdate, setNewUpdate] = useState('');

  const handleStatusUpdate = (e) => {
    e.preventDefault();
    if (!newStatus.trim() || !connection) return;
    
    try {
      console.log('Sending status update:', newStatus);
      connection.reducers.updateStatus(newStatus);
      setNewStatus('');
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAddUpdate = (e) => {
    e.preventDefault();
    if (!newUpdate.trim() || !connection) return;
    
    try {
      console.log('Adding update:', newUpdate);
      connection.reducers.addUpdate(newUpdate);
      setNewUpdate('');
    } catch (error) {
      console.error('Error adding update:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Controls</h3>
      
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
            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            disabled={!connection}
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
            className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            disabled={!connection}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminControls;