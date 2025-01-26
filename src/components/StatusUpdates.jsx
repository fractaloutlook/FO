import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const StatusUpdates = () => {
  const [currentStatus, setCurrentStatus] = useState('');
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    // Load initial data from localStorage
    const savedStatus = localStorage.getItem('currentStatus');
    const savedUpdates = JSON.parse(localStorage.getItem('updates') || '[]');
    
    if (savedStatus) setCurrentStatus(savedStatus);
    if (savedUpdates.length) setUpdates(savedUpdates);
  }, []);

  // Expose update functions to window for easy console access
  useEffect(() => {
    window.updateCurrentStatus = (newStatus) => {
      setCurrentStatus(newStatus);
      localStorage.setItem('currentStatus', newStatus);
      console.log('Status updated:', newStatus);
    };

    window.addUpdate = (update) => {
      const timestamp = new Date().toLocaleString();
      const newUpdate = { timestamp, text: update };
      setUpdates(prev => {
        const newUpdates = [newUpdate, ...prev];
        localStorage.setItem('updates', JSON.stringify(newUpdates));
        return newUpdates;
      });
      console.log('Update added:', update);
    };

    return () => {
      delete window.updateCurrentStatus;
      delete window.addUpdate;
    };
  }, []);

  return (
    <div className="space-y-4 mt-8">
      {/* Current Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle size={18} className="text-blue-500" />
          <h3 className="font-medium text-gray-900">Current Status:</h3>
        </div>
        <p className="text-gray-700">{currentStatus || "Working on these status boxes!"}</p> {/* "no current status" */}
      </div>

      {/* Updates Log */}
      <div className="bg-gray-50 rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Recent Updates</h3>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          <div className="space-y-2 p-4">
            {updates.map((update, index) => (
              <div key={index} className="text-sm">
                <span className="text-gray-500">{update.timestamp}:</span>
                <span className="text-gray-700 ml-2">{update.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusUpdates;