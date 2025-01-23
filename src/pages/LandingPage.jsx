import React, { useState, useEffect } from 'react';
import { Timer, Construction, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const [timeElapsed, setTimeElapsed] = useState('');
  const launchDate = new Date('2024-01-23T16:23:00'); // Update this to your actual launch time

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const diff = now - launchDate;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeElapsed(`${hours}h ${minutes}m`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [launchDate]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <div className="max-w-2xl mx-auto space-y-8">
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
            <span className="text-sm">Currently Under Construction (sorta!)</span>
          </div>

          {/* Main Content */}
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            "Claude and I are trying to be less like the scammers with our offerings!"
          </h1>
          
          <div className="space-y-6 text-gray-700">
            <p className="text-lg">
              Hey, I'm Tim. This is a real-time experiment in asking Claude to make $25
 		online without all of the nonsense false promises of teaching you to be
		a thought leader, write a novel in 20 days, make your old novel suddenly
		a best seller or whatever the heck. The best is "How to make money with AI!" 
		These people are nonsense and 90% scammers. Or at least liars.
            </p>

            {/* Status Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="font-medium text-gray-900">Current Status:</p>
              <ul className="mt-2 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Step 1: Make this landing page
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">⟳</span>
                  Step 2: Figure out what I'm actually selling
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gray-400">○</span>
                  Step 3: Set up a way to accept money (soon™)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gray-400">○</span>
                  Step 4: Convince someone this is worth $25 (?!?)
                </li>
              </ul>
            </div>

            <p className="text-lg">
              Will this work? Probably not! But you can watch us try. 
              Maybe Claude will figure out what we're selling before someone tries to buy it.
            </p>

            {/* Promises Section */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="font-medium text-blue-900 mb-2">Things I Promise:</p>
              <ul className="space-y-1 text-blue-700">
                <li className="flex items-center gap-2">
                  <span>•</span>
                  Total transparency about this weird experiment
                </li>
                <li className="flex items-center gap-2">
                  <span>•</span>
                  Regular updates as Claude figures this out
                </li>
                <li className="flex items-center gap-2">
                  <span>•</span>
                  No fake scarcity or "only 3 spots left!" nonsense—any scarcity mentioned will be REAL. :D
                </li>
              </ul>
            </div>
          </div>

          {/* CTA Button */}
          <button 
            className="w-full mt-8 bg-gray-200 text-gray-500 py-4 px-6 rounded-lg font-medium flex items-center justify-center gap-2 cursor-not-allowed"
            disabled
          >
            Buy Whatever This Becomes (Coming Soon)
            <ArrowRight size={20} />
          </button>

          <p className="text-xs text-center mt-4 text-gray-500">
            Future Refund Policy: If you don't find whatever this becomes worth $25, 
            I'll give you your money back if requested within 10 days of purchase.
          </p>
        </div>

        {/* Updates Section */}
        <div className="text-center text-sm text-gray-600">
          <p className="font-medium mb-2">Live Updates:</p>
          <div className="space-y-1">
            <p>Hour 0 (8:10pm): Claude made this landing page</p>
            <p>Hour 1: Added this updates section</p>
            <p>Hour 2: Still no idea what I'm selling</p>
            <p>Hour 3: Fixed the styling because it looked terrible</p>
	    <p>Hour 4: Went to bed because it was late and I gotta get on a day schedule</p>
	    <p>Hour ~19 (2:47pm) - Claude started up again, made a payment system module</p>
	    <p>Hour ~21 (3:53pm) - Finally got the github hosting functional - site is live!</p>
	    <p>Hour ~21 (4:05pm) - Got the css styling all smoove</p>
	    <p>Timenow 4:36 - did some updates to this file and pushed to github</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;