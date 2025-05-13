import React, { useState, useEffect } from 'react';
import { Timer, Construction } from 'lucide-react';
import KofiButton from '../components/KofiButton';
import StatusUpdates from '../components/StatusUpdates';
import ChatSystem from '../components/ChatSystem';
import PollSystem from '../components/PollSystem';

const LandingPage = () => {
  const [connection, setConnection] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState('');
  const launchDate = new Date('2025-01-23T14:10:00');

  // Timer update effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const diff = now - launchDate;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeElapsed(`${days}d ${hours}h ${minutes}m`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [launchDate]);

  // SpacetimeDB connection effect
  useEffect(() => {
    const connectToSpacetimeDB = async () => {
      try {
        console.log("Initializing SpacetimeDB connection...");
        
        // Dynamic import to avoid SSR issues
        const { DbConnection } = await import('../module_bindings');
        
        console.log("Creating connection...");
        const conn = DbConnection.builder()
          .withUri('wss://api.fractaloutlook.com') // Use the secure production URL
          .withModuleName('status-module')
          .withToken(localStorage.getItem('auth_token'))
          .onConnect((connectedConn, identity, token) => {
            console.log("Connected to SpacetimeDB!", identity);
            localStorage.setItem('auth_token', token);
            setConnection(connectedConn);
            
            // Check if the current user is an admin
            try {
              const adminRecords = Array.from(connectedConn.db.admin.iter());
              const currentIdentity = connectedConn.identity;
              
              const isCurrentUserAdmin = adminRecords.some(admin => 
                admin.identity?.toHexString?.() === currentIdentity?.toHexString?.()
              );
              
              console.log(`Admin check: ${isCurrentUserAdmin ? 'YES' : 'NO'}`);
              setIsAdmin(isCurrentUserAdmin);
            } catch (error) {
              console.error('Error checking admin status:', error);
            }
            
            // Add this right after setting connection and before subscription
            console.log("Available tables:", Object.keys(connectedConn.db).join(", "));

            // Set up subscription
            connectedConn.subscriptionBuilder()
              .onApplied((ctx) => {
                console.log("Subscription applied!");
              })
              .subscribe([
                'SELECT * FROM admin',
                'SELECT * FROM update_log',
                'SELECT * FROM current_status',
                'SELECT * FROM message',
                'SELECT * FROM user',
                //'SELECT * FROM poll',
                //'SELECT * FROM poll_option',
                //'SELECT * FROM poll_vote'
              ]);
          })
          .onConnectError((_, error) => {
            console.error("Connection error:", error);
          })
          .build();
        
        console.log("Connection attempt started...");
      } catch (error) {
        console.error("Failed to initialize SpacetimeDB:", error);
      }
    };
    
    connectToSpacetimeDB();
  }, []);

  return (
<div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
<div className="max-w-2xl mx-auto md:max-w-4xl lg:max-w-5xl space-y-8">
        {/* Timer Banner */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <Timer size={16} className="text-gray-500" />
          <span>Experiment started {timeElapsed} ago</span>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          {/* Construction Banner */}
          <div className="flex items-center gap-2 mb-6 bg-yellow-50 text-yellow-800 px-4 py-2 rounded-md">
            <Construction size={16} />
            <span className="text-sm">Currently Under Construction (madness.)</span>
          </div>

          {/* Main Content */}
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            "Well there's a thing here."
          </h1>

          <div className="space-y-6 text-gray-700">
            <p className="text-lg">
              Hey, I'm Tim. This is a real-time experiment and project collaboration between
              myself and AI to build a landing page without all of the nonsense false promises
              of teaching you to be a thought leader, write a novel in 20 days, make your old 
              novel suddenly a best seller or whatever the heck. The best is "How to make money 
              with AI!" These people are nonsense.

              I don't even know what this is yet. That much is true. I think it's a game though.
            </p>

            {/* Status Updates Component */}
            <StatusUpdates />

            {/* Promises Section */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="font-medium text-blue-900 mb-2">Things I Promise:</p>
              <ul className="space-y-1 text-blue-700">
                <li className="flex items-center gap-2">
                  <span>•</span>
                  Total transparency about this experiment
                  (except for the parts that are secret)
                </li>
                <li className="flex items-center gap-2">
                  <span>•</span>
                  Regular updates as we figure this out
                </li>
                <li className="flex items-center gap-2">
                  <span>•</span>
                  No fake scarcity or "only 3 spots left!" nonsense
                  Any scarcity mentioned will be REAL
                </li>
              </ul>
            </div>

            {/* Early Supporter Benefits Section *///// test 2}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <p className="font-medium text-green-900 mb-2">Knowing me:</p>
              <ul className="space-y-1 text-green-700">
                <li className="flex items-center gap-2">
                  <span>•</span>
                  This might be a game (currently 90% chance)
                </li>
                <li className="flex items-center gap-2">
                  <span>•</span>
                  or a trailhead? (currently maybe it always was)
                </li>
                <li className="flex items-center gap-2">
                  <span>•</span>
                  The first X people will probably get a cool title
                </li>
                <li className="flex items-center gap-2">
                  <span>•</span>
                  There will probably be a discord (59% chance)
                </li>
                <li className="flex items-center gap-2">
                  <span>•</span>
                  It will probably change directions a zillion times
                </li>
                <li className="flex items-center gap-2">
                  <span>•</span>
                  I will fix the updates section and put the og updates back in it
                  They have not been lost
                </li>
              </ul>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mt-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-1 rounded-lg shadow-sm">
              <ChatSystem connection={connection} />
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-1 rounded-lg shadow-sm">
              <PollSystem connection={connection} isAdmin={isAdmin} />
            </div>
          </div>

          {/* Ko-fi Integration */}
          <div className="mt-8">
            <KofiButton />
          </div>

          <p className="text-xs text-center mt-4 text-gray-500">
            Future Refund Policy: If you don't find whatever this becomes worth $25,
            I'll give you your money back if requested within 10 days of purchase.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;