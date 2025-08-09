# Proper Migration Guide: status-module → status-module-v2

This guide explains the **correct** way to migrate your data and handle module bindings.

## Current Status

✅ **New module published** - `status-module-v2` is running with cursor tracking  
✅ **Old module still running** - `status-module` with your existing data (UNTOUCHED)  
✅ **React app updated** - Now connects to `status-module-v2`  
❌ **Module bindings outdated** - Need to be regenerated for the new module  

## The Problem

The module bindings in `src/module_bindings/` were generated for the old module structure. The new module has:
- ✅ `mouse_state` table (for cursor tracking)
- ✅ `update_mouse_state` reducer (for sending cursor data)

But the TypeScript bindings don't include these, causing the error:
```
Cannot read properties of undefined (reading 'rowType')
```

## The Correct Solution

### Step 1: Regenerate Module Bindings (On Linux Server)

**This is the proper way** - regenerate the bindings after publishing the new module:

```bash
# Navigate to your repo
cd ~/your-repo

# Pull the latest changes
git pull origin main

# Navigate to server directory
cd server

# Regenerate the module bindings for the new module
spacetime generate-bindings status-module-v2 --output-dir ../src/module_bindings
```

### Step 2: Verify the New Bindings

After regeneration, check that the new bindings include:

1. **`mouse_state` table** in `src/module_bindings/index.ts`
2. **`update_mouse_state` reducer** in the reducers section
3. **`MouseState` type** in the types section

### Step 3: Test the Functionality

1. **Visit your React app** - It should now connect to `status-module-v2` with proper bindings
2. **Test cursor tracking** - Open multiple browser tabs and move your mouse around
3. **Verify functionality** - Check that chat, admin controls, etc. still work

### Step 4: Data Migration (When Ready)

When you're ready to migrate your data from `status-module` to `status-module-v2`:

```bash
# Use the SpacetimeDB CLI to copy data
spacetime call status-module view_status
spacetime call status-module-v2 update_status "Your status message"

# Or use the manual migration script (if it works with proper bindings)
node migrate-data.js
```

## Why This Approach is Correct

1. **No workarounds** - Proper module bindings regeneration
2. **Clean code** - TypeScript types match the actual module structure
3. **Maintainable** - Standard SpacetimeDB workflow
4. **Data preserved** - Old module untouched until you're ready to migrate

## Troubleshooting

### If `spacetime generate-bindings` doesn't exist

Some versions of SpacetimeDB don't have this command. In that case:

1. **Delete the old bindings**:
   ```bash
   rm -rf src/module_bindings/*
   ```

2. **Republish the module** (this should regenerate bindings):
   ```bash
   spacetime publish status-module-v2
   ```

3. **Check if bindings were regenerated** in `src/module_bindings/`

### If bindings still don't update

The bindings might be cached. Try:

```bash
# Clear any cached bindings
rm -rf src/module_bindings/*.ts
rm -rf src/module_bindings/index.ts

# Republish to regenerate
spacetime publish status-module-v2
```

## Success Criteria

Migration is successful when:

- ✅ Module bindings include `mouse_state` table and `update_mouse_state` reducer
- ✅ No TypeScript errors in the console
- ✅ Cursor tracking works (multiple browser tabs show mouse movements)
- ✅ Chat functionality works
- ✅ Admin controls work
- ✅ Old module data is preserved and accessible

## Next Steps

1. **Regenerate bindings** on your Linux server
2. **Test cursor tracking** with proper TypeScript support
3. **Migrate data** when you're ready (old module is untouched)
4. **Clean up** old module only after confirming everything works 