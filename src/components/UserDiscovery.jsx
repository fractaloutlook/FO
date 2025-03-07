// In a new component called UserDiscovery.jsx
import React, { useState, useEffect } from 'react';
import { getSimpleID } from '../utils/bigint-utils';

const UserDiscovery = ({ connection }) => {
  const [discoveries, setDiscoveries] = useState([]);
  const [userLevel, setUserLevel] = useState(0);
  
  useEffect(() => {
    if (connection?.identity) {
      // Mock discoveries based on user ID
      const userId = parseInt(getSimpleID(connection.identity)) || 0;
      const baseDiscoveries = [
        "You've discovered the first clue!",
        "You found the hidden path.",
        "A strange symbol appears...",
      ];
      
      // Unlock discoveries based on visit count or other factors
      const numDiscovered = Math.min(baseDiscoveries.length, 
        parseInt(localStorage.getItem('visitCount') || '0'));
      
      setDiscoveries(baseDiscoveries.slice(0, numDiscovered));
      setUserLevel(numDiscovered);
      
      // Increment visit count
      const visits = parseInt(localStorage.getItem('visitCount') || '0') + 1;
      localStorage.setItem('visitCount', visits.toString());
    }
  }, [connection]);
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 my-4">
      <h3 className="font-medium text-gray-900 mb-2">Your Journey</h3>
      {connection?.identity ? (
        <div>
          <p className="text-sm text-blue-600 mb-4">
            Explorer #{getSimpleID(connection.identity)} • Level {userLevel}
          </p>
          {discoveries.length > 0 ? (
            <div className="space-y-2">
              {discoveries.map((discovery, index) => (
                <div key={index} className="p-2 bg-blue-50 rounded text-blue-800">
                  {discovery}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 italic">Keep exploring to uncover secrets...</p>
          )}
        </div>
      ) : (
        <p className="text-gray-600 italic">Connecting to the network...</p>
      )}
    </div>
  );
};

export default UserDiscovery;