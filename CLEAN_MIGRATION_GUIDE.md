# Clean Migration Guide: Your Actual Situation

## Current Setup (What You Actually Have)

1. **`~/status-module/`** - Local Rust module directory (NOT a git repo)
   - Contains your Rust code (`src/lib.rs`)
   - This is where you published both `status-module` and `status-module-v2`

2. **`status-module`** - Old module (running with your data)
   - Contains all your existing data (users, messages, status, etc.)
   - **UNTOUCHED** - your data is safe here

3. **`status-module-v2`** - New module (running with cursor tracking)
   - Contains the new cursor tracking functionality
   - **EMPTY** - no data migrated yet

4. **GitHub repo (`FO`)** - Only client-side React code
   - Does NOT include the server-side Rust module
   - Needs to be cloned to get the latest client code

## Step-by-Step Migration Process

### Step 1: Get the Latest Client Code

```bash
# Navigate to your home directory
cd ~

# Clone the GitHub repo (if you don't have it)
git clone https://github.com/fractaloutlook/FO.git

# Navigate into the repo
cd FO

# Pull the latest changes
git pull origin main
```

### Step 2: Regenerate Module Bindings

The module bindings need to be regenerated for the new module structure:

```bash
# Navigate to the server directory in the cloned repo
cd server

# Clear old bindings (if they exist)
rm -rf ../src/module_bindings/*

# Republish the module to regenerate bindings
spacetime publish status-module-v2
```

**If that doesn't work**, try:

```bash
# Navigate back to your original status-module directory
cd ~/status-module

# Republish from there
spacetime publish status-module-v2
```

### Step 3: Verify the New Bindings

Check that the new bindings include the cursor tracking functionality:

```bash
# Check if the bindings were regenerated
ls -la ~/FO/src/module_bindings/

# Look for mouse_state table and update_mouse_state reducer
grep -i "mouse" ~/FO/src/module_bindings/index.ts
```

### Step 4: Test the Functionality

1. **Visit your React app** - It should now connect to `status-module-v2` with proper bindings
2. **Test cursor tracking** - Open multiple browser tabs and move your mouse around
3. **Verify functionality** - Check that chat, admin controls, etc. still work

### Step 5: Data Migration (When Ready)

When you're ready to migrate your data from `status-module` to `status-module-v2`:

```bash
# Use the SpacetimeDB CLI to copy data
spacetime call status-module view_status
spacetime call status-module-v2 update_status "Your status message"

# Or use the manual migration script (if it works with proper bindings)
cd ~/FO
node migrate-data.js
```

## Why This Approach is Correct

1. **No workarounds** - Proper module bindings regeneration
2. **Clean code** - TypeScript types match the actual module structure
3. **Maintainable** - Standard SpacetimeDB workflow
4. **Data preserved** - Old module untouched until you're ready to migrate

## Troubleshooting

### If `spacetime publish` doesn't regenerate bindings

Some versions of SpacetimeDB don't automatically regenerate bindings. In that case:

1. **Check if bindings exist**:
   ```bash
   ls -la ~/FO/src/module_bindings/
   ```

2. **If they don't exist or are outdated**, you may need to:
   - Copy the bindings from the old module
   - Or manually create them based on the module structure

### If you can't find the FO directory

If the git clone didn't work or you can't find it:

```bash
# Check what's in your home directory
ls -la ~

# Look for FO directory
find ~ -name "FO" -type d 2>/dev/null
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

1. **Clone the FO repo** to get the latest client code
2. **Regenerate bindings** for the new module
3. **Test cursor tracking** with proper TypeScript support
4. **Migrate data** when you're ready (old module is untouched)
5. **Clean up** old module only after confirming everything works 