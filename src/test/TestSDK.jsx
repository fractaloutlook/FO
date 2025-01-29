import React, { useEffect } from 'react';
import * as STDB from '@clockworklabs/spacetimedb-sdk';

const TestSDK = () => {
  useEffect(() => {
    console.log('TestSDK mounted');
    console.log('STDB:', STDB);
  }, []);

  return (
    <div>
      SDK Test Component
    </div>
  );
};

export default TestSDK;