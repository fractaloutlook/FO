# Manual Data Migration Guide

Since the automated migration script has compatibility issues, here's how to manually migrate your data from `status-module` to `status-module-v2`.

## Option 1: Manual Migration via React App

The easiest way is to use your React app to manually copy the data:

### Step 1: Connect to Old Module

1. **Temporarily change the module name** in `src/pages/LandingPage.jsx`:
   ```javascript
   .withModuleName('status-module')  // Change back to old module
   ```

2. **Open your React app** and note down:
   - Current status message
   - Important messages from chat
   - Any admin users you want to preserve

### Step 2: Connect to New Module

1. **Change the module name back** in `src/pages/LandingPage.jsx`:
   ```javascript
   .withModuleName('status-module-v2')  // Change to new module
   ```

2. **Manually recreate the data**:
   - Use admin controls to update the status
   - Re-send important messages
   - Add admin users as needed

## Option 2: Use SpacetimeDB CLI

You can also use the SpacetimeDB CLI to manually copy data:

### Step 1: Check Current Data

```bash
# Check what data exists in the old module
spacetime call status-module view_status
spacetime logs status-module
```

### Step 2: Copy Data to New Module

```bash
# Update status in new module
spacetime call status-module-v2 update_status "Your status message here"

# Add updates to new module
spacetime call status-module-v2 add_update "Your update message here"
```

## Option 3: Start Fresh (Simplest)

If you don't have critical data to preserve, you can simply:

1. **Use the new module** - It's already working with cursor tracking
2. **Start fresh** - New users will be created automatically
3. **Recreate important data** - Status, messages, etc.

## Recommended Approach

**For most cases, I recommend Option 3 (Start Fresh)** because:

- ✅ **Simplest** - No complex migration needed
- ✅ **Clean slate** - New module with all the latest features
- ✅ **No risk** - Old module still exists as backup
- ✅ **Cursor tracking works immediately** - New functionality ready to use

## If You Have Critical Data

If you have important data that must be preserved:

1. **Use Option 1** - Manual migration via React app
2. **Take screenshots** - Document current state before switching
3. **Test thoroughly** - Make sure everything works before removing old module

## Next Steps

1. **Test the new module** - Visit your React app (it should connect to `status-module-v2`)
2. **Verify cursor tracking** - Open multiple browser tabs and move your mouse
3. **Check functionality** - Test chat, admin controls, etc.
4. **Decide on migration** - Choose whether to migrate data or start fresh

## Success Criteria

Migration is successful when:

- ✅ Cursor tracking works (multiple browser tabs show mouse movements)
- ✅ Chat functionality works
- ✅ Admin controls work
- ✅ All important data is preserved (if you chose to migrate)
- ✅ No errors in browser console 