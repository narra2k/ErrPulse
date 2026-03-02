# Dashboard

The ErrPulse dashboard is a React-based SPA served by the ErrPulse server at [http://localhost:3800](http://localhost:3800). It provides real-time visibility into errors and requests across all your projects.

## Overview Page

The main dashboard shows:

- **Health score** — a 0–100 donut chart based on your error rate. Higher score means fewer errors relative to total requests.
- **Error count** — total errors in the last 24 hours
- **Request count** — total tracked HTTP requests
- **Error rate** — percentage of requests that resulted in errors
- **Real-time error feed** — new errors appear instantly via WebSocket
- **Errors over time** — hourly bar chart showing error frequency over the last 24 hours

## Errors Page

A filterable, searchable list of all error groups:

### Filters

- **Severity** — Fatal, Error, Warning, Info
- **Source** — Backend, Frontend
- **Status** — Unresolved, Acknowledged, Resolved, Ignored
- **Search** — full-text search on error messages

### Error List

Each row shows:

- Error type icon and severity badge
- Error message (truncated)
- Source (backend/frontend)
- First seen / last seen timestamps
- Occurrence count
- Current status

Pagination is supported with 50 errors per page.

## Error Detail Page

Click on any error to see full details:

### Plain-English Explanation

ErrPulse matches the error against 46 built-in patterns and shows:

- **Title** — e.g., "Connection Refused"
- **Explanation** — what the error means in plain English
- **Suggestion** — how to fix it

### Stack Trace Viewer

- Full stack trace with syntax highlighting
- In-app frames are highlighted to distinguish your code from library code
- Filename, function name, line number, and column number

### Event Timeline

A chronological list of every occurrence of this error, showing:

- Timestamp
- Request context (if available)
- Environment info (runtime, OS, browser)

### Status Management

Change the error's status:

- **Unresolved** — default, needs attention
- **Acknowledged** — someone is looking at it
- **Resolved** — fixed
- **Ignored** — not worth tracking

## Requests Page

An HTTP request log showing all tracked requests:

| Column    | Description                   |
| --------- | ----------------------------- |
| Method    | HTTP method (GET, POST, etc.) |
| URL       | Request URL path              |
| Status    | HTTP status code              |
| Duration  | Response time in milliseconds |
| Timestamp | When the request was made     |

Requests that resulted in errors are highlighted and linked to the corresponding error detail page.

## Project Selector

When you have multiple projects sending errors to ErrPulse, the dashboard shows a project selector:

- Click the project icon in the sidebar to open the project list
- Select a project to filter all views (overview, errors, requests) to that project only
- Select "All Projects" to see everything

## Real-Time Updates

The dashboard connects to the ErrPulse server via WebSocket (`ws://localhost:3800/ws`). Updates appear instantly when:

- A new error group is created
- A new event is added to an existing error
- An error's status changes
- A new HTTP request is logged

No polling — all updates are pushed in real time.
