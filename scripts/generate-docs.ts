import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ── Source imports ──────────────────────────────────────────────
// Import from source directly — these files have no external dependencies
import { ERROR_PATTERNS } from "../packages/core/src/explanations/patterns.js";
import {
  DEFAULT_SERVER_PORT,
  DEFAULT_DB_DIR,
  DEFAULT_DB_FILENAME,
  DEFAULT_SERVER_URL,
  EVENTS_ENDPOINT,
  ERRORS_ENDPOINT,
  REQUESTS_ENDPOINT,
  HEALTH_ENDPOINT,
  STATS_ENDPOINT,
  CORRELATION_HEADER,
  PROJECT_HEADER,
  MAX_MESSAGE_LENGTH,
  MAX_STACK_FRAMES,
  BATCH_SIZE,
  BATCH_INTERVAL_MS,
  SENSITIVE_HEADERS,
  SENSITIVE_FIELDS,
} from "../packages/core/src/constants.js";

// Import from node config source (not index.ts) to avoid auto-init side effects.
// Requires @errpulse/core to be built (pnpm build:core).
import { getConfig } from "../packages/node/src/config.js";

// ── Helpers ─────────────────────────────────────────────────────

function replaceMarkerBlock(content: string, name: string, generated: string): string {
  const regex = new RegExp(`<!-- GENERATED:${name} -->[\\s\\S]*?<!-- /GENERATED:${name} -->`);
  const replacement = `<!-- GENERATED:${name} -->\n${generated}\n<!-- /GENERATED:${name} -->`;
  if (!regex.test(content)) {
    console.warn(`  Warning: marker GENERATED:${name} not found — skipping`);
    return content;
  }
  return content.replace(regex, replacement);
}

function escapeForTable(s: string): string {
  return s.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((v) => `\`${v}\``).join(", ");
  }
  return `\`${JSON.stringify(value)}\``;
}

// ── 1. Error Patterns ───────────────────────────────────────────

function generateErrorPatternsTable(): string {
  const lines = ["| Title | Pattern | Explanation | Suggestion |", "| --- | --- | --- | --- |"];

  for (const p of ERROR_PATTERNS) {
    lines.push(
      `| ${escapeForTable(p.title)} | \`${escapeForTable(p.pattern.source)}\` | ${escapeForTable(p.explanation)} | ${escapeForTable(p.suggestion)} |`
    );
  }

  lines.push(
    "",
    `_${ERROR_PATTERNS.length} patterns — auto-generated from \`packages/core/src/explanations/patterns.ts\`._`
  );
  return lines.join("\n");
}

// ── 2. Constants ────────────────────────────────────────────────

const CONSTANT_DESCRIPTIONS: Record<string, string> = {
  DEFAULT_SERVER_PORT: "Default server port",
  DEFAULT_DB_DIR: "Database directory name (in home dir)",
  DEFAULT_DB_FILENAME: "Database file name",
  DEFAULT_SERVER_URL: "Default server URL used by SDKs",
  EVENTS_ENDPOINT: "Events API endpoint",
  ERRORS_ENDPOINT: "Errors API endpoint",
  REQUESTS_ENDPOINT: "Requests API endpoint",
  HEALTH_ENDPOINT: "Health check API endpoint",
  STATS_ENDPOINT: "Stats API endpoint",
  CORRELATION_HEADER: "Correlation ID header name",
  PROJECT_HEADER: "Project ID header name",
  MAX_MESSAGE_LENGTH: "Maximum error message length",
  MAX_STACK_FRAMES: "Maximum stack frames stored per event",
  BATCH_SIZE: "SDK event buffer size",
  BATCH_INTERVAL_MS: "SDK batch flush interval (ms)",
  SENSITIVE_HEADERS: "Headers redacted from request logs",
  SENSITIVE_FIELDS: "Body fields redacted from request logs",
};

function generateConstantsTable(): string {
  const entries: [string, unknown][] = [
    ["DEFAULT_SERVER_PORT", DEFAULT_SERVER_PORT],
    ["DEFAULT_SERVER_URL", DEFAULT_SERVER_URL],
    ["DEFAULT_DB_DIR", DEFAULT_DB_DIR],
    ["DEFAULT_DB_FILENAME", DEFAULT_DB_FILENAME],
    ["EVENTS_ENDPOINT", EVENTS_ENDPOINT],
    ["ERRORS_ENDPOINT", ERRORS_ENDPOINT],
    ["REQUESTS_ENDPOINT", REQUESTS_ENDPOINT],
    ["HEALTH_ENDPOINT", HEALTH_ENDPOINT],
    ["STATS_ENDPOINT", STATS_ENDPOINT],
    ["CORRELATION_HEADER", CORRELATION_HEADER],
    ["PROJECT_HEADER", PROJECT_HEADER],
    ["MAX_MESSAGE_LENGTH", MAX_MESSAGE_LENGTH],
    ["MAX_STACK_FRAMES", MAX_STACK_FRAMES],
    ["BATCH_SIZE", BATCH_SIZE],
    ["BATCH_INTERVAL_MS", BATCH_INTERVAL_MS],
    ["SENSITIVE_HEADERS", SENSITIVE_HEADERS],
    ["SENSITIVE_FIELDS", SENSITIVE_FIELDS],
  ];

  const lines = ["| Constant | Value | Description |", "| --- | --- | --- |"];

  for (const [name, value] of entries) {
    const desc = CONSTANT_DESCRIPTIONS[name] ?? name;
    lines.push(`| \`${name}\` | ${formatValue(value)} | ${desc} |`);
  }

  return lines.join("\n");
}

// ── 3. Node SDK Config ──────────────────────────────────────────

const CONFIG_META: Record<string, { type: string; description: string }> = {
  serverUrl: { type: "`string`", description: "ErrPulse server URL" },
  projectId: {
    type: "`string`",
    description: "Project identifier for multi-project setups",
  },
  enabled: { type: "`boolean`", description: "Enable or disable the SDK" },
  sampleRate: {
    type: "`number`",
    description: "Sample rate from 0.0 to 1.0 (1.0 = capture all)",
  },
  captureConsoleErrors: {
    type: "`boolean`",
    description: "Capture `console.error` calls",
  },
  captureUncaughtExceptions: {
    type: "`boolean`",
    description: "Capture uncaught exceptions",
  },
  captureUnhandledRejections: {
    type: "`boolean`",
    description: "Capture unhandled promise rejections",
  },
  monitorMemory: {
    type: "`boolean`",
    description: "Monitor memory usage and emit warnings",
  },
  memoryThresholdMB: {
    type: "`number`",
    description: "Memory threshold in MB before warning",
  },
  memoryCheckIntervalMs: {
    type: "`number`",
    description: "How often to check memory (ms)",
  },
  beforeSend: {
    type: "`function`",
    description: "Callback to modify or drop events before sending",
  },
};

function generateNodeConfigTable(): string {
  const defaults = getConfig() as Record<string, unknown>;

  const allKeys = [
    "serverUrl",
    "projectId",
    "enabled",
    "sampleRate",
    "captureConsoleErrors",
    "captureUncaughtExceptions",
    "captureUnhandledRejections",
    "monitorMemory",
    "memoryThresholdMB",
    "memoryCheckIntervalMs",
    "beforeSend",
  ];

  const lines = ["| Option | Type | Default | Description |", "| --- | --- | --- | --- |"];

  for (const key of allKeys) {
    const meta = CONFIG_META[key];
    const type = meta?.type ?? "`unknown`";
    const desc = meta?.description ?? key;
    const value = defaults[key];
    const defaultStr = value === undefined ? "`undefined`" : `\`${JSON.stringify(value)}\``;
    lines.push(`| \`${key}\` | ${type} | ${defaultStr} | ${desc} |`);
  }

  return lines.join("\n");
}

// ── Main ────────────────────────────────────────────────────────

function updateFile(filePath: string, blocks: Record<string, string>): void {
  const abs = path.resolve(ROOT, filePath);
  let content = fs.readFileSync(abs, "utf-8");

  for (const [name, generated] of Object.entries(blocks)) {
    content = replaceMarkerBlock(content, name, generated);
  }

  fs.writeFileSync(abs, content);
  console.log(`  ${filePath}`);
}

console.log("Generating docs from source...\n");

updateFile("docs/advanced/error-patterns.md", {
  ERROR_PATTERNS: generateErrorPatternsTable(),
});

updateFile("docs/advanced/configuration.md", {
  CONSTANTS: generateConstantsTable(),
});

updateFile("docs/sdks/node.md", {
  NODE_CONFIG: generateNodeConfigTable(),
});

console.log("\nDone.");
