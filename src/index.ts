/**
 * MCP Personal Coding Style Assistant — Server Entry
 *
 * Deployed on Cloudflare Workers, serves MCP over Streamable HTTP.
 * Business logic (tools, resources, prompts) lives in ./server.ts.
 * Style data lives in ./style.ts.
 */

import { createMcpHonoApp } from "@modelcontextprotocol/hono";
import { createMcpHandler } from "@modelcontextprotocol/server";
import type { Context } from "hono";
import { createServer } from "./server.js";
import { STYLE_PREFERENCES } from "./style.js";

// ============================================================================
// API Key authentication
// ============================================================================

function getAllowedKeys(): Set<string> {
  const raw = (globalThis as Record<string, unknown>).ALLOWED_API_KEYS as
    | string
    | undefined;
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map(k => k.trim())
      .filter(Boolean),
  );
}

async function verifyToken(
  request: Request,
): Promise<{ clientId: string; token: string; scopes: string[] } | null> {
  const allowedKeys = getAllowedKeys();

  // No keys configured = bypass auth (local dev mode)
  if (allowedKeys.size === 0) {
    return { clientId: "anonymous", token: "", scopes: [] };
  }

  const auth = request.headers.get("Authorization");
  if (!auth) return null;

  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match || !match[1]) return null;

  const token = match[1].trim();
  if (!allowedKeys.has(token)) return null;

  return {
    clientId: `key-${token.slice(0, 8)}`,
    token,
    scopes: [],
  };
}

// ============================================================================
// Hono app + MCP mount
// ============================================================================

// createMcpHonoApp provides JSON body parsing and DNS rebinding protection
const app = createMcpHonoApp();
const handler = createMcpHandler(() => createServer());

// Mount MCP endpoint with API Key authentication
app.all("/mcp", async (c: Context) => {
  const authInfo = await verifyToken(c.req.raw);
  if (!authInfo) {
    return c.json(
      {
        error:
          "Unauthorized — provide a valid Bearer token in the Authorization header",
      },
      401,
    );
  }

  return handler.fetch(c.req.raw, {
    authInfo,
    parsedBody: c.get("parsedBody"),
  });
});

// Health check endpoint (no auth required)
app.get("/health", (c: Context) => {
  return c.json({
    status: "ok",
    server: "style-assistant",
    version: "1.0.0",
    categories: Object.fromEntries(
      (["General", "Business", "Language"] as const).map(cat => [
        cat,
        STYLE_PREFERENCES.filter(p => p.category === cat).map(p => p.language),
      ]),
    ),
  });
});

// Root endpoint shows basic info
app.get("/", (c: Context) => {
  return c.json({
    name: "MCP Style Assistant",
    description: "Personalized coding assistant MCP server",
    endpoint: "/mcp",
    health: "/health",
    docs: "https://modelcontextprotocol.io/docs",
  });
});

export default app;
