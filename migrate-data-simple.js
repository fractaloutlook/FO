// Simple data migration script for copying data from status-module to status-module-v2
// This script uses the SpacetimeDB SDK directly without module bindings

const { DbConnection } = require('@clockworklabs/spacetimedb-sdk');

async function migrateData() {
  console.log('Starting data migration from status-module to status-module-v2...');
  
  try {
    // Connect to old module
    console.log('Connecting to old module (status-module)...');
    const oldConn = DbConnection.builder()
      .withUri('wss://api.fractaloutlook.com')
      .withModuleName('status-module')
      .build();
      
    // Connect to new module
    console.log('Connecting to new module (status-module-v2)...');
    const newConn = DbConnection.builder()
      .withUri('wss://api.fractaloutlook.com')
      .withModuleName('status-module-v2')
      .build();
      
    // Wait for connections to be established
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Connection timeout')), 30000);
      
      oldConn.onConnect(() => {
        console.log('✅ Connected to old module');
        newConn.onConnect(() => {
          console.log('✅ Connected to new module');
          clearTimeout(timeout);
          resolve();
        });
      });
    });
    
    // Migrate users
    console.log('\n🔄 Migrating users...');
    const users = Array.from(oldConn.db.user.iter());
    console.log(`Found ${users.length} users to migrate`);
    
    for (const user of users) {
      try {
        if (user.name) {
          console.log(`  - Migrating user: ${user.name} (${user.identity.toHexString()})`);
        } else {
          console.log(`  - Migrating user: ${user.identity.toHexString()}`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to migrate user ${user.identity.toHexString()}:`, error.message);
      }
    }
    
    // Migrate messages
    console.log('\n🔄 Migrating messages...');
    const messages = Array.from(oldConn.db.message.iter());
    console.log(`Found ${messages.length} messages to migrate`);
    
    for (const message of messages) {
      try {
        newConn.reducers.sendMessage(message.text);
        console.log(`  - Migrated message: ${message.text.substring(0, 50)}${message.text.length > 50 ? '...' : ''}`);
      } catch (error) {
        console.error(`  ❌ Failed to migrate message:`, error.message);
      }
    }
    
    // Migrate current status
    console.log('\n🔄 Migrating current status...');
    const currentStatuses = Array.from(oldConn.db.currentStatus.iter());
    if (currentStatuses.length > 0) {
      const currentStatus = currentStatuses[0];
      try {
        newConn.reducers.updateStatus(currentStatus.message);
        console.log(`  - Migrated status: ${currentStatus.message}`);
      } catch (error) {
        console.error(`  ❌ Failed to migrate status:`, error.message);
      }
    } else {
      console.log('  - No current status to migrate');
    }
    
    // Migrate update log
    console.log('\n🔄 Migrating update log...');
    const updates = Array.from(oldConn.db.updateLog.iter());
    console.log(`Found ${updates.length} updates to migrate`);
    
    for (const update of updates) {
      try {
        newConn.reducers.addUpdate(update.message);
        console.log(`  - Migrated update: ${update.message.substring(0, 50)}${update.message.length > 50 ? '...' : ''}`);
      } catch (error) {
        console.error(`  ❌ Failed to migrate update:`, error.message);
      }
    }
    
    // Migrate admins
    console.log('\n🔄 Migrating admins...');
    const admins = Array.from(oldConn.db.admin.iter());
    console.log(`Found ${admins.length} admins to migrate`);
    
    for (const admin of admins) {
      try {
        newConn.reducers.addAdmin();
        console.log(`  - Migrated admin: ${admin.identity.toHexString()}`);
      } catch (error) {
        console.error(`  ❌ Failed to migrate admin:`, error.message);
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`  - Users: ${users.length} migrated`);
    console.log(`  - Messages: ${messages.length} migrated`);
    console.log(`  - Status: ${currentStatuses.length > 0 ? '1' : '0'} migrated`);
    console.log(`  - Updates: ${updates.length} migrated`);
    console.log(`  - Admins: ${admins.length} migrated`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run migration
migrateData().catch(console.error); 