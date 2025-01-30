import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import * as STDB from '@clockworklabs/spacetimedb-sdk';

const StatusUpdates = () => {
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');
  const [statusMessage, setStatusMessage] = useState('');

  /* ===========================================
   * ATTEMPT #2 - Basic DBConnectionBuilder
   * =========================================== */
  /*
  useEffect(() => {
    const connectToDatabase = async () => {
      try {
        console.log('Starting connection attempt #2');
        console.log('DBConnectionBuilder available:', !!STDB.DBConnectionBuilder);
        
        const builder = new STDB.DBConnectionBuilder();
        console.log('Builder created:', builder);
        
        const connection = builder
          .withUri('wss://testnet.spacetimedb.com')
          .withModuleName('status-module')
          .build();
          
        console.log('Connection built:', connection);

      } catch (error) {
        console.error('Failed to initialize:', error);
        setConnectionStatus(`Error: ${error.message}`);
      }
    };

    connectToDatabase();
  }, []);
  */

  /* ===========================================
   * ATTEMPT #3 - With Module Configuration
   * =========================================== */
  /*
  useEffect(() => {
    const connectToDatabase = async () => {
      try {
        console.log('Starting connection attempt #3');
        
        // Simple module configuration
        const moduleConfig = {
          tables: {},
          reducers: {},
          eventContextConstructor: (imp, event) => ({ ...imp, event }),
          dbViewConstructor: (conn) => ({}),
          reducersConstructor: (conn) => ({})
        };

        // Create builder with required params
        const builder = new STDB.DBConnectionBuilder(
          moduleConfig,
          imp => imp  // Identity function for dbConnectionConstructor
        );
        console.log('Builder created:', builder);
        
        // Build with the info parameter the interface shows
        const connection = builder
          .withUri('wss://testnet.spacetimedb.com')
          .withModuleName('status-module')
          .build();
          
        console.log('Connection built:', connection);

      } catch (error) {
        console.error('Failed to initialize:', error);
        setConnectionStatus(`Error: ${error.message}`);
      }
    };

    connectToDatabase();
  }, []);
  */

  /* ===========================================
   * ATTEMPT #4 - With Auth Token Handling
   * =========================================== */
  useEffect(() => {
    const connectToDatabase = async () => {
      try {
        console.log('Starting connection attempt #4');
        
        const savedToken = localStorage.getItem('stdb_token');
        console.log('Saved token:', savedToken);
        
        const moduleConfig = {
          tables: {},
          reducers: {},
          eventContextConstructor: (imp, event) => ({ ...imp, event }),
          dbViewConstructor: (conn) => ({}),
          reducersConstructor: (conn) => ({})
        };

        // Create builder with required params
        const builder = new STDB.DBConnectionBuilder(
          moduleConfig,
          imp => imp
        );
        console.log('Builder created:', builder);
        
        // Create base builder with required settings
        const baseBuilder = builder
          .withUri('wss://testnet.spacetimedb.com')
          .withModuleName('status-module');
          
        // Add credentials if we have them
        const connection = savedToken 
          ? baseBuilder.withCredentials([new STDB.Identity(savedToken), savedToken]).build()
          : baseBuilder.build();
          
        console.log('Connection built:', connection);

      } catch (error) {
        console.error('Failed to initialize:', error);
        setConnectionStatus(`Error: ${error.message}`);
      }
    };

    connectToDatabase();
  }, []);

  return (
    <div className="space-y-4 mt-8">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle size={18} className="text-blue-500" />
          <h3 className="font-medium text-gray-900">Status:</h3>
        </div>
        <p className="text-gray-700">
          {connectionStatus}
          {statusMessage && (
            <span className="block mt-2">
              Message: {statusMessage}
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default StatusUpdates;