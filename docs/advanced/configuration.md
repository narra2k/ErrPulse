# Configuration

ErrPulse is designed to work with zero configuration, but you can customize the server, SDKs, and database behavior.

## Server Configuration

The ErrPulse server accepts the following configuration options:

```ts
interface ServerConfig {
  port: number; // default: 3800
  host: string; // default: "0.0.0.0"
  dbPath: string; // default: ~/.errpulse/errpulse.db
  corsOrigin: string | string[] | boolean; // default: true
  dashboardEnabled: boolean; // default: true
}
```

| Option             | Type                            | Default                   | Description                       |
| ------------------ | ------------------------------- | ------------------------- | --------------------------------- |
| `port`             | `number`                        | `3800`                    | Port the server listens on        |
| `host`             | `string`                        | `"0.0.0.0"`               | Host the server binds to          |
| `dbPath`           | `string`                        | `~/.errpulse/errpulse.db` | Path to the SQLite database file  |
| `corsOrigin`       | `string \| string[] \| boolean` | `true`                    | CORS origin configuration         |
| `dashboardEnabled` | `boolean`                       | `true`                    | Whether to serve the dashboard UI |

## Environment Variables

| Variable        | Description | Default   |
| --------------- | ----------- | --------- |
| `ERRPULSE_PORT` | Server port | `3800`    |
| `ERRPULSE_HOST` | Server host | `0.0.0.0` |

```bash
# Start on a custom port
ERRPULSE_PORT=4000 npx errpulse

# Bind to localhost only
ERRPULSE_HOST=127.0.0.1 npx errpulse
```

## Database

### Location

The SQLite database is created at `~/.errpulse/errpulse.db` by default. The directory is created automatically if it doesn't exist.

### WAL Mode

ErrPulse enables SQLite's Write-Ahead Logging (WAL) mode for better concurrency. This allows reads to happen while writes are in progress, which is important for the real-time dashboard.

### Pragmas

```sql
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;
```

### Clearing Data

To clear all stored data while the server is running:

```bash
npx errpulse clear
```

Or via the API:

```bash
curl -X POST http://localhost:3800/api/clear
```

To start completely fresh, stop the server and delete the database file:

```bash
rm ~/.errpulse/errpulse.db
```

## CORS Configuration

By default, CORS is set to `true`, which allows requests from any origin. This is appropriate for local development.

To restrict origins, configure the server with a specific origin or list of origins:

```ts
// Single origin
{
  corsOrigin: "http://localhost:3000";
}

// Multiple origins
{
  corsOrigin: ["http://localhost:3000", "http://localhost:5173"];
}

// Disable CORS (same-origin only)
{
  corsOrigin: false;
}
```

## Disabling the Dashboard

If you only need the API server (e.g., in a headless environment), you can disable the dashboard:

```ts
{
  dashboardEnabled: false;
}
```

The REST API and WebSocket endpoints will still be available.

## SDK Configuration

For SDK-specific configuration, see:

- [Node.js SDK — Configuration](/sdks/node#configuration)
- [React SDK — Props Reference](/sdks/react#props-reference)

## Constants

These are the built-in defaults used throughout ErrPulse:

<!-- GENERATED:CONSTANTS -->

| Constant              | Value                                                                                                                                                                                                       | Description                            |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `DEFAULT_SERVER_PORT` | `3800`                                                                                                                                                                                                      | Default server port                    |
| `DEFAULT_SERVER_URL`  | `"http://localhost:3800"`                                                                                                                                                                                   | Default server URL used by SDKs        |
| `DEFAULT_DB_DIR`      | `".errpulse"`                                                                                                                                                                                               | Database directory name (in home dir)  |
| `DEFAULT_DB_FILENAME` | `"errpulse.db"`                                                                                                                                                                                             | Database file name                     |
| `EVENTS_ENDPOINT`     | `"/api/events"`                                                                                                                                                                                             | Events API endpoint                    |
| `ERRORS_ENDPOINT`     | `"/api/errors"`                                                                                                                                                                                             | Errors API endpoint                    |
| `REQUESTS_ENDPOINT`   | `"/api/requests"`                                                                                                                                                                                           | Requests API endpoint                  |
| `HEALTH_ENDPOINT`     | `"/api/health"`                                                                                                                                                                                             | Health check API endpoint              |
| `STATS_ENDPOINT`      | `"/api/stats"`                                                                                                                                                                                              | Stats API endpoint                     |
| `CORRELATION_HEADER`  | `"x-errpulse-correlation-id"`                                                                                                                                                                               | Correlation ID header name             |
| `PROJECT_HEADER`      | `"x-errpulse-project-id"`                                                                                                                                                                                   | Project ID header name                 |
| `MAX_MESSAGE_LENGTH`  | `2048`                                                                                                                                                                                                      | Maximum error message length           |
| `MAX_STACK_FRAMES`    | `50`                                                                                                                                                                                                        | Maximum stack frames stored per event  |
| `BATCH_SIZE`          | `10`                                                                                                                                                                                                        | SDK event buffer size                  |
| `BATCH_INTERVAL_MS`   | `100`                                                                                                                                                                                                       | SDK batch flush interval (ms)          |
| `SENSITIVE_HEADERS`   | `authorization`, `cookie`, `set-cookie`, `x-api-key`, `x-auth-token`                                                                                                                                        | Headers redacted from request logs     |
| `SENSITIVE_FIELDS`    | `password`, `passwd`, `secret`, `token`, `apiKey`, `api_key`, `accessToken`, `access_token`, `refreshToken`, `refresh_token`, `creditCard`, `credit_card`, `ssn`, `cardNumber`, `card_number`, `cvv`, `cvc` | Body fields redacted from request logs |

<!-- /GENERATED:CONSTANTS -->
