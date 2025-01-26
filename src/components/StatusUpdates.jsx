import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import * as STDB from '@clockworklabs/spacetimedb-sdk';

// Log the SDK exports to understand what's available
console.log('SpaceTimeDB SDK exports:', STDB);

// Import our generated table types
import { CurrentStatus } from '../module_bindings/current_status_table';
import { UpdateLog } from '../module_bindings/update_log_table';
import { Admin } from '../module_bindings/admin_table';

const StatusUpdates = () => {
  const [client, setClient] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('');
  const [updates, setUpdates] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Log the SDK object again inside the effect to ensure it's loaded
    console.log('SpaceTimeDB SDK in effect:', STDB);
    
    // We'll add the connection logic back once we confirm the correct SDK structure
    
  }, []);

  return (
    <div className="space-y-4 mt-8">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle size={18} className="text-blue-500" />
          <h3 className="font-medium text-gray-900">Current Status:</h3>
        </div>
        <p className="text-gray-700">Initializing connection...</p>
      </div>
    </div>
  );
};

export default StatusUpdates;