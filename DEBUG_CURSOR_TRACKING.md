# Debug Cursor Tracking Issues

## Problem: No Visible Mouse Cursors

Let's debug why cursor tracking isn't working.

## Step 1: Check Browser Console

Open your browser's developer tools (F12) and check the console for:

1. **Connection messages**:
   ```
   ✅ "Connected to SpacetimeDB!"
   ✅ "Available tables: admin, current_status, message, user, mouse_state"
   ✅ "Subscription applied!"
   ```

2. **Cursor tracking messages**:
   ```
   ✅ "Cursor tracking is supported"
   ✅ "Mouse state sent: {x: 100, y: 200, ...}"
   ```

3. **Error messages**:
   ```
   ❌ "Cannot read properties of undefined (reading 'rowType')"
   ❌ "Error setting up cursor subscription"
   ❌ "Failed to send mouse state"
   ```

## Step 2: Check Module Connection

Add this debug code to your `LandingPage.jsx`:

```javascript
// Add this right after setting connection and before subscription
console.log("🔍 DEBUG: Available tables:", Object.keys(connectedConn.db).join(", "));
console.log("🔍 DEBUG: Has mouseState table:", !!connectedConn.db.mouseState);
console.log("🔍 DEBUG: Has updateMouseState reducer:", !!connectedConn.reducers?.updateMouseState);
```

## Step 3: Check CursorTracker Component

Add this debug code to your `CursorTracker.jsx`:

```javascript
// Add this at the top of the component
useEffect(() => {
  console.log("🔍 DEBUG: CursorTracker connection:", !!connection);
  console.log("🔍 DEBUG: Has mouseState table:", !!connection?.db?.mouseState);
  console.log("🔍 DEBUG: Has updateMouseState reducer:", !!connection?.reducers?.updateMouseState);
}, [connection]);
```

## Step 4: Test Manual Mouse State Sending

Add this test button to your `CursorTracker.jsx`:

```javascript
// Add this in the return statement, after the toggle button
<button
  onClick={() => {
    if (connection?.reducers?.updateMouseState) {
      console.log("🔍 DEBUG: Testing mouse state send...");
      connection.reducers.updateMouseState(100, 200, false, false, false, 0, 0, false, "test", 1920, 1080);
      console.log("🔍 DEBUG: Mouse state sent!");
    } else {
      console.log("🔍 DEBUG: updateMouseState reducer not available");
    }
  }}
  className="fixed top-4 right-32 z-50 px-3 py-1 bg-blue-500 text-white rounded text-sm"
>
  🧪 Test Mouse State
</button>
```

## Step 5: Check Network Tab

1. **Open Network tab** in developer tools
2. **Filter by "WS"** (WebSocket)
3. **Look for WebSocket connection** to `wss://api.fractaloutlook.com`
4. **Check if messages are being sent/received**

## Step 6: Verify Module Bindings

```bash
# Check if mouse_state is in the bindings
grep -i "mouse_state" ~/FO/src/module_bindings/index.ts

# Check if update_mouse_state is in the bindings
grep -i "update_mouse_state" ~/FO/src/module_bindings/index.ts
```

## Common Issues and Solutions

### Issue 1: Connection Not Established
**Symptoms**: No "Connected to SpacetimeDB!" message
**Solution**: Check if the module name is correct (`status-module-v2`)

### Issue 2: MouseState Table Not Available
**Symptoms**: "Available tables" doesn't include `mouse_state`
**Solution**: Regenerate module bindings using `spacetime generate`

### Issue 3: Subscription Not Working
**Symptoms**: No cursor updates when other users move mouse
**Solution**: Check if subscription is set up properly

### Issue 4: Reducer Not Available
**Symptoms**: "updateMouseState reducer not available"
**Solution**: Check if the reducer was properly generated in bindings

## Expected Debug Output

**Success case**:
```
🔍 DEBUG: Available tables: admin, current_status, message, user, mouse_state
🔍 DEBUG: Has mouseState table: true
🔍 DEBUG: Has updateMouseState reducer: true
🔍 DEBUG: CursorTracker connection: true
✅ Cursor tracking is supported
```

**Failure case**:
```
🔍 DEBUG: Available tables: admin, current_status, message, user
🔍 DEBUG: Has mouseState table: false
🔍 DEBUG: Has updateMouseState reducer: false
❌ Cursor tracking not supported - missing mouse_state table or updateMouseState reducer
```

## Next Steps

1. **Run the debug code** above
2. **Check console output** for the debug messages
3. **Report the results** - what messages do you see?
4. **Fix the specific issue** based on the debug output 