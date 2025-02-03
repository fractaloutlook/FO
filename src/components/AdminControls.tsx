import React, { useState, useEffect } from 'react';
import { Pencil, Send } from 'lucide-react';
import type { DBConnection } from '../module_bindings';

interface AdminControlsProps {
  connection: any;
}

const AdminControls: React.FC<AdminControlsProps> = ({ connection }) => {
  const [newStatus, setNewStatus] = useState('');
  const [newUpdate, setNewUpdate] = useState('');

  // Debug log when connection prop changes
  useEffect(() => {
    console.log('AdminControls received connection:', connection);
    if (connection && connection.reducers) {
      console.log('Connection has reducers:', Object.keys(connection.reducers));
    }
  }, [connection]);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatus.trim()) return;
    
    console.log('Attempting status update with connection:', connection);
    if (!connection || !connection.reducers) {
      console.error('Invalid connection object:', connection);
      return;
    }

    try {
      await connection.reducers.updateStatus(newStatus);
      console.log('Status update sent successfully');
      setNewStatus('');
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdate.trim()) return;

    console.log('Attempting to add update with connection:', connection);
    if (!connection || !connection.reducers) {
      console.error('Invalid connection object:', connection);
      return;
    }

    try {
      await connection.reducers.addUpdate(newUpdate);
      console.log('Update added successfully');
      setNewUpdate('');
    } catch (err) {
      console.error('Failed to add update:', err);
    }
  };

  if (!connection || !connection.reducers) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-50 text-red-700 rounded-lg border border-red-200 shadow-lg p-4">
        Error: Invalid connection state
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg border border-gray-200 shadow-lg p-4 w-96">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Controls</h3>
      
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
          >
            <Pencil size={20} />
          </button>
        </div>
      </form>

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
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminControls;