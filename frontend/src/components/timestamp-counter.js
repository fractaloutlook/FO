import React, { useState, useEffect } from 'react';

const TimestampCounter = ({ launchDate }) => {
  const [timeElapsed, setTimeElapsed] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const launch = new Date(launchDate);
      const diff = now - launch;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeElapsed(`${days} days, ${hours} hours, ${minutes} minutes`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [launchDate]);

  return (
    <div className="text-gray-600">
      Launched: {timeElapsed} ago
    </div>
  );
};

export default TimestampCounter;