/**
 * MCP Personal Coding Style Assistant
 *
 * Deployed on Cloudflare Workers, serves MCP over Streamable HTTP.
 * Clients (VS Code, Claude Code, etc.) can:
 *   1. Read your coding style preferences (Resources)
 *   2. Call code review and other tools (Tools)
 *   3. Use predefined prompt templates (Prompts)
 */

import { createMcpHonoApp } from "@modelcontextprotocol/hono";
import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import type { Context } from "hono";
import * as z from "zod/v4";

// ============================================================================
// Coding style preferences — define your own rules here
// ============================================================================

interface StylePreference {
  language: string;
  rules: string[];
}

const STYLE_PREFERENCES: StylePreference[] = [
  // ── General ─────────────────────────────────────────────────────────
  {
    language: "General",
    rules: [
      "Readability over micro-performance",
      "Keep functions short with a single responsibility",
      "Use meaningful variable names, avoid abbreviations",
      "Handle errors explicitly, never swallow exceptions",
      "Comments explain 'why', not 'what'",
      "2 spaces for indentation",
      "Semicolons required",
      "Single quotes for strings",
      "camelCase for variables and functions",
      "PascalCase for classes, interfaces, and types",
      "kebab-case for CSS class selectors",
      "snake_case for static file names (images, configs, etc.)",
    ],
  },

  // ── TypeScript / JavaScript ─────────────────────────────────────────
  {
    language: "TypeScript",
    rules: [
      "Prefer interface over type (use type for unions or mapped types)",
      "Enable strict mode in tsconfig",
      "Use async/await, avoid raw Promise chains",
      "Use Zod / Standard Schema for external input validation",
      "Export named functions (for utilities, helpers, APIs)",
      "Use `import type` for type-only imports",
      "No `any` — prefer `unknown` and narrow with guards",
      "Use `const` assertions for literal types",
    ],
  },

  // ── React / Next.js ─────────────────────────────────────────────────
  {
    language: "React",
    rules: [
      "Prefer function components + Hooks",
      "Keep components pure/presentational, extract logic into custom Hooks",
      "Use Tailwind CSS, avoid CSS-in-JS",
      "Define Props with interface, place at the top of the file",
      "Default import for components, named import for hooks/utils",
      "Use React Server Components by default in Next.js",
      "'use client' only when interactivity is needed",
    ],
  },

  // ── Vue / Nuxt ──────────────────────────────────────────────────────
  {
    language: "Vue",
    rules: [
      "Use Composition API with <script setup lang='ts'>",
      "Default import for components",
      "Use `defineProps` / `defineEmits` with type annotations",
      "Extract reusable logic into composables",
      "Use Pinia for state management",
      "Single-File Components (.vue) for all components",
    ],
  },

  // ── SolidJS ─────────────────────────────────────────────────────────
  {
    language: "SolidJS",
    rules: [
      "Use signals and effects, avoid classes and 'this'",
      "Prefer `createSignal` over mutable state",
      "Use `For` / `Show` control flow components instead of .map() / &&",
      "Default import for components",
      "Keep component logic in primitives (custom hooks)",
    ],
  },

  // ── Astro ───────────────────────────────────────────────────────────
  {
    language: "Astro",
    rules: [
      "Use `---` frontmatter for server-side logic",
      "Minimal client JS — use client:* directives sparingly",
      "Colocate components with their Astro pages when possible",
      "Prefer `.astro` over `.mdx` for content-heavy pages with custom layout",
    ],
  },

  // ── Node.js / Bun (Hono, Express, Nest) ─────────────────────────────
  {
    language: "Node.js",
    rules: [
      "Use Hono for new projects (lightweight, fast, CF Workers compatible)",
      "Organize by feature (not by file type)",
      "Use middleware for cross-cutting concerns (auth, logging, validation)",
      "Handle all errors through a centralized error handler",
      "Use environment variables for all configuration",
      "Named imports for utilities and middleware",
    ],
  },

  // ── Go ──────────────────────────────────────────────────────────────
  {
    language: "Go",
    rules: [
      "Use `go fmt` before every commit",
      "Prefer composition over inheritance (interfaces, embedding)",
      "Return errors explicitly, avoid panics",
      "Use `errgroup` for concurrent operations",
      "Keep package scope minimal — export only what's needed",
    ],
  },

  // ── CSS / Tailwind ──────────────────────────────────────────────────
  {
    language: "CSS",
    rules: [
      "Use Tailwind utility classes as the primary approach",
      "Use CSS Modules for complex custom styles that Tailwind can't cover",
      "kebab-case for custom CSS class selectors",
      "Use CSS custom properties (variables) for theme values",
      "Avoid !important at all costs",
    ],
  },
];

// Format style preferences as plain text
function formatStyleGuide(language?: string): string {
  const prefs = language
    ? STYLE_PREFERENCES.filter(
        p => p.language.toLowerCase() === language.toLowerCase(),
      )
    : STYLE_PREFERENCES;

  if (prefs.length === 0 && language) {
    return `No style config found for "${language}". Available languages: ${STYLE_PREFERENCES.map(p => p.language).join(", ")}`;
  }

  return prefs
    .map(section => {
      const rules = section.rules.map((r, i) => `  ${i + 1}. ${r}`).join("\n");
      return `## ${section.language}\n${rules}`;
    })
    .join("\n\n");
}

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

interface KeyAuthInfo {
  clientId: string;
  token: string;
  scopes: string[];
}

async function verifyToken(request: Request): Promise<KeyAuthInfo | null> {
  const allowedKeys = getAllowedKeys();

  // No keys configured = bypass auth (local dev mode)
  if (allowedKeys.size === 0) {
    return { clientId: "anonymous", token: "", scopes: [] };
  }

  const auth = request.headers.get("Authorization");
  if (!auth) return null;

  // Parse Bearer token
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
// MCP server factory
// ============================================================================

function createServer(): McpServer {
  const server = new McpServer({
    name: "style-assistant",
    version: "1.0.0",
  });

  // ------------------------------------------------------------------
  // Resources: expose coding style data
  // ------------------------------------------------------------------

  server.registerResource(
    "coding-style",
    "style://preferences",
    {
      description: "My coding style & preferences guide",
      mimeType: "text/markdown",
    },
    async () => ({
      contents: [
        {
          uri: "style://preferences",
          mimeType: "text/markdown",
          text: formatStyleGuide(),
        },
      ],
    }),
  );

  // Per-language style resources
  for (const pref of STYLE_PREFERENCES) {
    const lang = pref.language.toLowerCase();
    server.registerResource(
      `coding-style-${lang}`,
      `style://preferences/${lang}`,
      {
        description: `${pref.language} coding style guide`,
        mimeType: "text/markdown",
      },
      async () => ({
        contents: [
          {
            uri: `style://preferences/${lang}`,
            mimeType: "text/markdown",
            text: formatStyleGuide(pref.language),
          },
        ],
      }),
    );
  }

  // ------------------------------------------------------------------
  // Tools
  // ------------------------------------------------------------------

  // Tool 1: Get style guidelines for a language
  server.registerTool(
    "get_style_guidelines",
    {
      description:
        "Get coding style guidelines for a language or framework. Returns all if no language is specified.",
      inputSchema: z.object({
        language: z
          .string()
          .optional()
          .describe("Programming language, e.g. TypeScript, React, Python"),
      }),
    },
    async ({ language }) => ({
      content: [{ type: "text", text: formatStyleGuide(language) }],
    }),
  );

  // Tool 2: List all configured languages
  server.registerTool(
    "list_languages",
    {
      description: "List all languages with configured coding styles",
    },
    async () => ({
      content: [
        {
          type: "text",
          text: STYLE_PREFERENCES.map(p => `- ${p.language}`).join("\n"),
        },
      ],
    }),
  );

  // Tool 3: Get server status
  server.registerTool(
    "status",
    {
      description: "Check the MCP server status and configuration",
    },
    async () => ({
      content: [
        {
          type: "text",
          text: [
            "✅ style-assistant MCP server is running",
            `📋 ${STYLE_PREFERENCES.length} languages configured`,
            `🔧 ${STYLE_PREFERENCES.map(p => p.language).join(", ")}`,
            `📦 Version: 1.0.0`,
            `🌐 Protocol: MCP 2026-07-28 (Streamable HTTP)`,
          ].join("\n"),
        },
      ],
    }),
  );

  // ------------------------------------------------------------------
  // Prompts
  // ------------------------------------------------------------------

  server.registerPrompt(
    "code-review",
    {
      description: "Review code against my coding style",
      argsSchema: z.object({
        code: z.string().describe("The code snippet to review"),
        language: z
          .string()
          .optional()
          .describe("Programming language (TypeScript / React / Python, etc.)"),
      }),
    },
    async ({ code, language }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              "Please review this code against my coding style guide:",
              "",
              formatStyleGuide(language),
              "",
              "---",
              "Code to review:",
              "```",
              code,
              "```",
              "",
              "Point out what doesn't match the style guide and suggest improvements.",
            ].join("\n"),
          },
        },
      ],
    }),
  );

  return server;
}

// ============================================================================
// Hono app + MCP mount
// ============================================================================

// createMcpHonoApp provides JSON body parsing and DNS rebinding protection out of the box
const app = createMcpHonoApp();
const handler = createMcpHandler(() => createServer());

// Mount MCP endpoint with API Key authentication
app.all("/mcp", async (c: Context) => {
  // Verify API Key
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

  // Forward auth info and parsed body to MCP handler
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
    languages: STYLE_PREFERENCES.map(p => p.language),
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
