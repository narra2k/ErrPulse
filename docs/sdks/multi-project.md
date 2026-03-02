# Multi-Project Setup

ErrPulse supports tracking errors from multiple applications in a single server instance. Each SDK sends a `projectId`, and the dashboard filters all views per project.

## How It Works

1. Each SDK is configured with a `projectId`
2. When the server receives the first event with a new `projectId`, it auto-registers the project
3. The dashboard shows a project selector to filter all views
4. All API endpoints accept a `?projectId=` query parameter

## Configuring Project IDs

### Node.js SDK

```ts
import { init } from "@errpulse/node";

init({
  projectId: "api-service",
});
```

### React SDK

```tsx
<ErrPulseProvider endpoint="http://localhost:3800" projectId="web-app">
  <App />
</ErrPulseProvider>
```

## Example: Multiple Services

Suppose you have a web app, an API service, and a background worker:

```ts
// Web frontend (React)
<ErrPulseProvider endpoint="http://localhost:3800" projectId="web-app">
  <App />
</ErrPulseProvider>

// API service (Express)
import { init } from "@errpulse/node";
init({ projectId: "api-service" });

// Background worker (Node.js)
import { init } from "@errpulse/node";
init({ projectId: "worker" });
```

All three send errors to the same ErrPulse server. The dashboard shows all errors by default, and you can filter by project to see only errors from a specific service.

## Dashboard Project Selector

The dashboard includes a project selector that:

- Shows all registered projects
- Filters the overview stats, error list, error details, and request log by the selected project
- Persists across page navigation

## API Filtering

All API endpoints support project filtering:

```bash
# Get errors for a specific project
curl http://localhost:3800/api/errors?projectId=api-service

# Get stats for a specific project
curl http://localhost:3800/api/stats?projectId=web-app

# Get requests for a specific project
curl http://localhost:3800/api/requests?projectId=worker
```

## Auto-Registration

Projects are created automatically when the server receives the first event with a new `projectId`. There is no manual registration step. You can list all registered projects:

```bash
curl http://localhost:3800/api/projects
```

Response:

```json
{
  "projects": [
    { "id": "abc123", "name": "api-service", "createdAt": "2025-01-15T10:30:00.000Z" },
    { "id": "def456", "name": "web-app", "createdAt": "2025-01-15T10:31:00.000Z" }
  ]
}
```
