# Why ErrPulse?

ErrPulse is a free, local-first error monitoring tool for developers who want instant visibility into errors without vendor lock-in, cloud accounts, or configuration files.

## Comparison

| Feature                        | ErrPulse             | Sentry                  | LogRocket              |
| ------------------------------ | -------------------- | ----------------------- | ---------------------- |
| **Setup**                      | `npx errpulse`       | Account + DSN + config  | Account + SDK + config |
| **Pricing**                    | Free forever         | Free tier, then paid    | Free tier, then paid   |
| **Data location**              | Your machine         | Their cloud             | Their cloud            |
| **Config files**               | None needed          | sentry.properties, .env | .env                   |
| **Accounts**                   | None                 | Required                | Required               |
| **Backend errors**             | Yes                  | Yes                     | Limited                |
| **Frontend errors**            | Yes                  | Yes                     | Yes                    |
| **HTTP request tracking**      | Yes                  | Partial                 | Yes                    |
| **Real-time updates**          | WebSocket            | Polling                 | Polling                |
| **Plain-English explanations** | 46 built-in patterns | AI-suggested            | No                     |
| **Error correlation**          | Frontend ↔ Backend   | Partial                 | Frontend only          |
| **Self-hosted**                | By design            | Enterprise only         | No                     |

## Key Differentiators

### Zero Config

There is no configuration file. `npx errpulse` starts a server. Import the SDK and it works. No DSN, no API keys, no environment variables required.

### Local-First

Your error data stays on your machine in a SQLite database at `~/.errpulse/errpulse.db`. No data leaves your network unless you choose to deploy the server externally.

### Free Forever

ErrPulse is MIT-licensed open source. There are no usage limits, no paid tiers, and no feature gates.

### One Command

The entire stack — API server, SQLite database, WebSocket server, and React dashboard — starts with a single command.

## What Gets Caught

### Backend (@errpulse/node)

| Error Type                     | Captured By                          |
| ------------------------------ | ------------------------------------ |
| Uncaught exceptions            | `process.on("uncaughtException")`    |
| Unhandled promise rejections   | `process.on("unhandledRejection")`   |
| Express route errors (4xx/5xx) | `expressErrorHandler()` middleware   |
| Next.js API route errors       | `withErrPulse()` wrapper             |
| `console.error` calls          | Console interceptor                  |
| Memory threshold warnings      | Memory monitor (configurable)        |
| All HTTP requests              | `expressRequestHandler()` middleware |

### Frontend (@errpulse/react)

| Error Type                                | Captured By                   |
| ----------------------------------------- | ----------------------------- |
| JavaScript runtime errors                 | `window.onerror`              |
| Unhandled promise rejections              | `window.onunhandledrejection` |
| React component crashes                   | Error boundary                |
| Failed fetch requests                     | Fetch interceptor             |
| Failed XHR requests                       | XHR interceptor               |
| `console.error` calls                     | Console interceptor           |
| Resource load failures (img, script, css) | Capture-phase event listener  |

## Error Correlation

ErrPulse correlates frontend and backend errors using a correlation ID:

1. The React SDK generates a unique `X-ErrPulse-Correlation-ID` header for every outgoing fetch request
2. The Node.js SDK reads this header from incoming requests
3. If a backend error occurs during that request, both the frontend request and backend error share the same correlation ID
4. The dashboard links them together, so you can trace a user action to the server error it caused

This happens automatically — no configuration required.
