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
  category: 'General' | 'Business' | 'Language';
  language: string;
  rules: string[];
}

const CATEGORY_LABELS: Record<StylePreference['category'], string> = {
  General: '📐 General Coding Habits',
  Business: '🏢 Business Logic Patterns',
  Language: '🔧 Language-Specific Rules',
};

const STYLE_PREFERENCES: StylePreference[] = [
  // ==================================================================
  // 📐 General Coding Habits
  // ==================================================================
  {
    category: 'General',
    language: 'Git & Workflow',
    rules: [
      "Commit format: (type)[scope]: description",
      "  type: feat | fix | refactor | chore | docs | style | test | perf",
      "  scope: the feature or module name (e.g. (feat)[auth]: add login flow)",
      "  Always work on a feature branch, but the commit message itself doesn't need to name the branch",
      "  Keep commits atomic — one logical change per commit",
    ],
  },
  {
    category: 'General',
    language: 'Programming Paradigm',
    rules: [
      "Prefer functional programming style. Avoid OOP (classes, inheritance, this)",
      "Write closures freely — even for a single local variable, a closure is fine",
      "Use pure functions where possible (no side effects)",
      "Prefer immutable data — use spread / structuredClone instead of mutation",
      "Compose small functions over large monolithic ones",
    ],
  },
  {
    category: 'General',
    language: 'Type Discipline',
    rules: [
      "Always use TypeScript over JavaScript for any serious project",
      "Write concrete types. Avoid `any` at all costs",
      "Priority when choosing a type representation: union types > enums > plain string",
      "Prefer `interface` over `type` (use `type` for unions and mapped types)",
      "Use `unknown` instead of `any`, then narrow with type guards",
    ],
  },
  {
    category: 'General',
    language: 'Code Craft',
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
      "kebab-case for CSS class selectors in HTML/CSS",
      "snake_case for static file names (images, configs, etc.)",
    ],
  },

  // ==================================================================
  // 🏢 Business Logic Patterns
  // ==================================================================
  {
    category: 'Business',
    language: 'Data & Validation',
    rules: [
      "Use Zod (or Standard Schema) to validate all external inputs at the boundary",
      "Parse, don't validate — transform raw input into typed, validated structures",
      "Keep business logic decoupled from the framework / transport layer",
      "Prefer pure data flow: input → validate → transform → output",
      "Avoid business logic in components or route handlers — extract into services",
    ],
  },
  {
    category: 'Business',
    language: 'Error Handling',
    rules: [
      "Use a Result / Either pattern instead of throwing exceptions for expected failures",
      "Centralized error handler for unexpected errors (catch at the boundary)",
      "Return user-friendly error messages, never leak internals",
      "Log errors with enough context to debug, but no sensitive data",
    ],
  },

  // ==================================================================
  // 🔧 Language-Specific Rules
  // ==================================================================
  {
    category: 'Language',
    language: 'TypeScript',
    rules: [
      "Enable strict mode in tsconfig",
      "Use async/await, avoid raw Promise chains",
      "Export named functions (for utilities, helpers, APIs)",
      "Use `import type` for type-only imports",
      "Use `const` assertions for literal types",
    ],
  },
  {
    category: 'Language',
    language: 'React',
    rules: [
      "Prefer function components + Hooks. Avoid class components",
      "Keep components pure/presentational, extract logic into custom Hooks",
      "Use Tailwind CSS, avoid CSS-in-JS",
      "Define Props with interface, place at the top of the file",
      "Default import for components, named import for hooks/utils",
      "Use React Server Components by default in Next.js",
      "'use client' only when interactivity is needed",
    ],
  },
  {
    category: 'Language',
    language: 'Vue',
    rules: [
      "Use Composition API with <script setup lang='ts'>",
      "Default import for components",
      "Use `defineProps` / `defineEmits` with type annotations",
      "Extract reusable logic into composables",
      "Use Pinia for state management",
      "Single-File Components (.vue) for all components",
    ],
  },
  {
    category: 'Language',
    language: 'SolidJS',
    rules: [
      "Use signals and effects, avoid classes and 'this'",
      "Prefer `createSignal` over mutable state",
      "Use `<For>` / `<Show>` control flow components instead of .map() / &&",
      "Default import for components",
      "Keep component logic in primitives (custom hooks)",
    ],
  },
  {
    category: 'Language',
    language: 'Astro',
    rules: [
      "Use `---` frontmatter for server-side logic",
      "Minimal client JS — use client:* directives sparingly",
      "Colocate components with their Astro pages when possible",
      "Prefer `.astro` over `.mdx` for content-heavy pages with custom layout",
    ],
  },
  {
    category: 'Language',
    language: 'Node.js',
    rules: [
      "Use Hono for new projects (lightweight, fast, CF Workers compatible)",
      "Organize by feature (not by file type)",
      "Use middleware for cross-cutting concerns (auth, logging, validation)",
      "Handle all errors through a centralized error handler",
      "Use environment variables for all configuration",
      "Named imports for utilities and middleware",
    ],
  },
  {
    category: 'Language',
    language: 'Go',
    rules: [
      "Use `go fmt` before every commit",
      "Prefer composition over inheritance (interfaces, embedding)",
      "Return errors explicitly, avoid panics",
      "Use `errgroup` for concurrent operations",
      "Keep package scope minimal — export only what's needed",
    ],
  },
  {
    category: 'Language',
    language: 'CSS',
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
function formatStyleGuide(
  language?: string,
  category?: StylePreference['category'],
): string {
  let prefs = STYLE_PREFERENCES;

  if (language) {
    prefs = prefs.filter(
      p => p.language.toLowerCase() === language.toLowerCase(),
    );
  }
  if (category) {
    prefs = prefs.filter(p => p.category === category);
  }

  if (prefs.length === 0) {
    const hint = language
      ? `No style config found for "${language}".`
      : `No config found for category "${category}".`;
    return `${hint} Available: ${STYLE_PREFERENCES.map(p => p.language).join(", ")}`;
  }

  // Group by category
  const grouped = new Map<StylePreference['category'], StylePreference[]>();
  for (const pref of prefs) {
    const list = grouped.get(pref.category) ?? [];
    list.push(pref);
    grouped.set(pref.category, list);
  }

  const parts: string[] = [];
  for (const [cat, items] of grouped) {
    parts.push(`# ${CATEGORY_LABELS[cat]}`);
    for (const item of items) {
      const rules = item.rules.map((r, i) => `  ${i + 1}. ${r}`).join("\n");
      parts.push(`## ${item.language}\n${rules}`);
    }
  }
  return parts.join("\n\n");
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

  // Per-category resources
  server.registerResource(
    'coding-style-general',
    'style://general',
    {
      description: 'General coding habits',
      mimeType: 'text/markdown',
    },
    async () => ({
      contents: [
        {
          uri: 'style://general',
          mimeType: 'text/markdown',
          text: formatStyleGuide(undefined, 'General'),
        },
      ],
    }),
  );

  server.registerResource(
    'coding-style-business',
    'style://business',
    {
      description: 'Business logic patterns',
      mimeType: 'text/markdown',
    },
    async () => ({
      contents: [
        {
          uri: 'style://business',
          mimeType: 'text/markdown',
          text: formatStyleGuide(undefined, 'Business'),
        },
      ],
    }),
  );

  // Per-language resources (Language category only)
  for (const pref of STYLE_PREFERENCES.filter(p => p.category === 'Language')) {
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

  // Tool 1: Get style guidelines
  server.registerTool(
    "get_style_guidelines",
    {
      description:
        "Get coding style guidelines — filter by language, category, or both. Returns everything if no filter is specified.",
      inputSchema: z.object({
        language: z
          .string()
          .optional()
          .describe(
            "Filter by language (e.g. TypeScript, React, Vue, Node.js, Go, CSS)",
          ),
        category: z
          .enum(['General', 'Business', 'Language'])
          .optional()
          .describe(
            "Filter by category: General (coding habits), Business (logic patterns), Language (language-specific rules)",
          ),
      }),
    },
    async ({ language, category }) => ({
      content: [{ type: "text", text: formatStyleGuide(language, category) }],
    }),
  );

  // Tool 2: List all configured categories and languages
  server.registerTool(
    "list_categories",
    {
      description: "List all style categories and their languages",
    },
    async () => {
      const grouped = new Map<StylePreference['category'], string[]>();
      for (const pref of STYLE_PREFERENCES) {
        const list = grouped.get(pref.category) ?? [];
        list.push(pref.language);
        grouped.set(pref.category, list);
      }

      const lines: string[] = [];
      for (const [cat, langs] of grouped) {
        lines.push(`${CATEGORY_LABELS[cat]}`);
        lines.push(langs.map(l => `  - ${l}`).join('\n'));
      }
      return { content: [{ type: 'text', text: lines.join('\n\n') }] };
    },
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
            `📋 ${STYLE_PREFERENCES.length} rule sets configured`,
            `📐 ${STYLE_PREFERENCES.filter(p => p.category === 'General').length} general habits`,
            `🏢 ${STYLE_PREFERENCES.filter(p => p.category === 'Business').length} business patterns`,
            `🔧 ${STYLE_PREFERENCES.filter(p => p.category === 'Language').length} language-specific`,
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
    categories: Object.fromEntries(
      ['General', 'Business', 'Language'].map(cat => [
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
