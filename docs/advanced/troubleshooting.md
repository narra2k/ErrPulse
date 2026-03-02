# Troubleshooting

Common issues and how to fix them.

## Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3800`

Another process is using port 3800. Either stop it or use a different port:

```bash
# Find what's using port 3800
lsof -i :3800

# Use a different port
npx errpulse start --port 4000
```

Remember to update the SDK's `serverUrl` to match the new port:

```ts
// Node.js
init({ serverUrl: "http://localhost:4000" });

// React
<ErrPulseProvider endpoint="http://localhost:4000">
```

## CORS Errors from Frontend SDK

**Error in browser console:** `Access to fetch at 'http://localhost:3800/api/events' from origin 'http://localhost:3000' has been blocked by CORS policy`

By default, ErrPulse allows all origins (`corsOrigin: true`). If you're seeing CORS errors:

1. **Check the server is running** — CORS errors sometimes mask a "server not reachable" error
2. **Check the endpoint URL** — make sure the `endpoint` prop in `ErrPulseProvider` matches the actual server URL
3. **Check for proxies** — if your dev server proxies requests, the origin might be different than expected

## Events Not Appearing in Dashboard

If you're sending events but they don't show up in the dashboard:

1. **Check the server is running:**

   ```bash
   npx errpulse status
   ```

2. **Check the SDK endpoint matches the server:**

   ```ts
   // These must match
   // Server: npx errpulse start --port 3800
   // SDK: init({ serverUrl: "http://localhost:3800" })
   ```

3. **Check the SDK is enabled:**

   ```ts
   // Make sure enabled isn't set to false
   init({ enabled: true });
   ```

4. **Check the sample rate:**

   ```ts
   // A sampleRate of 0.1 means only 10% of events are captured
   init({ sampleRate: 1.0 }); // Capture everything
   ```

5. **Check the beforeSend callback isn't dropping events:**

   ```ts
   init({
     beforeSend: (event) => {
       // Returning null drops the event
       return event; // Make sure you're returning the event
     },
   });
   ```

6. **Check the browser network tab** — look for failed requests to `/api/events` or `/api/events/batch`

## WebSocket Disconnections

The dashboard connects to `ws://localhost:3800/ws` for real-time updates. If updates stop appearing:

1. **Refresh the dashboard page** — the WebSocket will reconnect
2. **Check the server is still running** — `npx errpulse status`
3. **Check for network issues** — VPN, firewalls, or proxy servers can interfere with WebSocket connections

## Memory Warnings

If you're seeing `memory_warning` events:

1. **Check the threshold** — the default is 512MB. If your app normally uses more, increase it:

   ```ts
   init({ memoryThresholdMB: 1024 });
   ```

2. **Disable memory monitoring** if you don't need it:

   ```ts
   init({ monitorMemory: false });
   ```

3. **Investigate the memory usage** — the warning means your app's heap usage exceeded the threshold, which could indicate a memory leak

## Database File Permissions

**Error:** `SQLITE_CANTOPEN: unable to open database file`

The server can't create or access the database at `~/.errpulse/errpulse.db`:

1. **Check the directory exists:**

   ```bash
   ls -la ~/.errpulse/
   ```

2. **Check permissions:**

   ```bash
   # The directory needs read/write access
   chmod 755 ~/.errpulse/
   chmod 644 ~/.errpulse/errpulse.db
   ```

3. **Check disk space:**
   ```bash
   df -h ~
   ```

## SDK Errors Don't Crash Your App

By design, ErrPulse SDK errors never crash your application. If the SDK encounters an internal error (e.g., can't reach the server), it logs a warning to `console.warn` and continues silently. Your app will keep running even if ErrPulse is completely unreachable.

## Still Stuck?

If you're still having issues:

1. Check the [GitHub Issues](https://github.com/Meghshyams/ErrPulse/issues) for known problems
2. Open a new issue with:
   - ErrPulse version
   - Node.js version
   - Steps to reproduce
   - Error messages and stack traces
