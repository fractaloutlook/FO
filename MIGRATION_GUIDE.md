# Data Migration Guide: status-module → status-module-v2

This guide will help you migrate your existing data from `status-module` to `status-module-v2` while preserving all user data, messages, and settings.

## Prerequisites

- Both `status-module` and `status-module-v2` must be published and running
- You need admin access to both modules
- Your React app should be updated to use `status-module-v2`

## Step 1: Publish the New Module

On your Linux server:

```bash
# Navigate to your repo
cd ~/your-repo

# Pull the latest changes
git pull origin main

# Navigate to server directory
cd server

# Publish the new module
spacetime publish status-module-v2
```

## Step 2: Verify Both Modules Are Running

```bash
# Check if both modules are running
spacetime list

# You should see both:
# - status-module (old)
# - status-module-v2 (new)
```

## Step 3: Run the Migration Script

The migration script will copy all your data from the old module to the new one:

```bash
# Navigate to your project root
cd ~/your-repo

# Run the migration script
node migrate-data.js
```

## Step 4: Verify Migration

1. **Check the new module** by visiting your React app (it should now connect to `status-module-v2`)
2. **Verify data is present**:
   - Users should be migrated
   - Messages should be preserved
   - Current status should be copied
   - Admin users should be preserved

## Step 5: Test the New Functionality

1. **Test cursor tracking** - Open multiple browser tabs and verify that mouse cursors are visible
2. **Test chat functionality** - Send messages and verify they work
3. **Test admin functions** - Verify admin controls still work

## Step 6: Clean Up (Optional)

Once you're satisfied that everything is working:

```bash
# Stop the old module (optional - you can keep it as backup)
spacetime stop status-module

# Or delete it completely (WARNING: This will permanently delete the old module)
spacetime delete status-module
```

## Troubleshooting

### Migration Script Fails

If the migration script fails:

1. **Check module names** - Ensure both modules are published with the correct names
2. **Check permissions** - Make sure you have admin access to both modules
3. **Check network** - Ensure your server can connect to the SpacetimeDB instance

### Data Not Migrated

If some data didn't migrate:

1. **Check console logs** - Look for error messages in the migration script output
2. **Manual migration** - You can manually copy specific data using the SpacetimeDB CLI
3. **Retry migration** - Run the migration script again (it's safe to run multiple times)

### Cursor Tracking Not Working

If cursor tracking isn't working:

1. **Check module bindings** - Ensure the new module has the `mouse_state` table
2. **Check subscriptions** - Verify the React app is subscribing to `mouse_state`
3. **Check console errors** - Look for any JavaScript errors in the browser console

## Rollback Plan

If something goes wrong, you can easily rollback:

1. **Revert React app** - Change `status-module-v2` back to `status-module` in `LandingPage.jsx`
2. **Keep old module** - Don't delete the old module until you're 100% sure everything works
3. **Test thoroughly** - Make sure all functionality works before removing the old module

## Success Criteria

Migration is successful when:

- ✅ All users are present in the new module
- ✅ All messages are preserved
- ✅ Current status is copied
- ✅ Admin users have admin privileges
- ✅ Cursor tracking works
- ✅ Chat functionality works
- ✅ No data loss occurred 