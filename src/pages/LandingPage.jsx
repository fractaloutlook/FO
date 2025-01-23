import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Timer, Construction } from 'lucide-react';

const LandingPage = () => {
  const [timeElapsed, setTimeElapsed] = useState('');
  const launchDate = new Date('2024-01-22T12:00:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const diff = now - launchDate;
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      setTimeElapsed(`${hours}h ${minutes}m`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [launchDate]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-8">
          <Timer size={16} />
          <span>Experiment started {timeElapsed} ago</span>
        </div>

        <Card className="p-8 mb-8 bg-white">
          <div className="flex items-center gap-2 mb-6">
            <Construction className="text-yellow-500" />
            <span className="text-sm text-yellow-600">Currently Under Construction (Obviously)</span>
          </div>

          <h1 className="text-3xl font-bold mb-6">
            "I'm Trying to Make $25 Online Without Being a Scammer"
          </h1>
          
          <div className="space-y-6 text-gray-700">
            <p>
              Hey, I'm [Your Name]. This is a real-time experiment in trying to make 
              money online without resorting to the usual "Make 6-figures with this one weird trick!" 
              nonsense.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">Current Status:</p>
              <ul className="mt-2 space-y-2">
                <li>• Step 1: Make this landing page ✓</li>
                <li>• Step 2: Figure out what I'm actually selling ⟳</li>
                <li>• Step 3: Set up a way to accept money (soon™)</li>
                <li>• Step 4: Convince someone this is worth $25 (?!?)</li>
              </ul>
            </div>

            <p>
              Will this work? Probably not! But you can watch me try. 
              Maybe I'll even figure out what I'm selling before someone tries to buy it.
            </p>

            <div className="text-sm bg-blue-50 p-4 rounded-lg">
              <p className="font-medium text-blue-800">Things I Promise:</p>
              <ul className="mt-2 space-y-1 text-blue-700">
                <li>• Total transparency about this weird experiment</li>
                <li>• Regular updates as I figure this out</li>
                <li>• No fake scarcity or "only 3 spots left!" nonsense</li>
              </ul>
            </div>
          </div>

          <Button className="w-full mt-8 py-6" size="lg" disabled>
            <span>Buy Whatever This Becomes (Coming Soon)</span>
            <ArrowRight className="ml-2" />
          </Button>

          <p className="text-xs text-center mt-4 text-gray-500">
            Future Refund Policy: If you don't find whatever this becomes worth $25, 
            I'll give you your money back. I mean, obviously.
          </p>
        </Card>

        <div className="text-center text-sm text-gray-600">
          <p className="mb-2">Live Updates:</p>
          <div className="space-y-1">
            <p>Hour 0: Made this landing page</p>
            <p>Hour 1: Added this updates section</p>
            <p>Hour 2: Still no idea what I'm selling</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;