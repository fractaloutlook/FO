import React, { useEffect } from 'react';
import * as STDB from '@clockworklabs/spacetimedb-sdk';

const TestSDK = () => {
  useEffect(() => {
    console.log('All STDB exports:');
    Object.keys(STDB).forEach(key => {
      const value = STDB[key];
      console.log(`${key}:`, value);
      if (value && typeof value === 'function') {
        console.log(`${key} prototype methods:`, Object.getOwnPropertyNames(value.prototype));
      }
    });
  }, []);

  return (
    <div>
      Check console for SDK exports
      <TestSDK />
    </div>
    
  );
};

export default TestSDK;