/**
 * MCP server factory — registers all tools, resources, and prompts
 */

import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { STYLE_PREFERENCES, formatStyleGuide } from './style.js';

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'style-assistant',
    version: '1.0.0',
  });

  // ------------------------------------------------------------------
  // Resources: expose coding style data
  // ------------------------------------------------------------------

  server.registerResource(
    'coding-style',
    'style://preferences',
    {
      description: 'My coding style & preferences guide',
      mimeType: 'text/markdown',
    },
    async () => ({
      contents: [
        {
          uri: 'style://preferences',
          mimeType: 'text/markdown',
          text: formatStyleGuide(),
        },
      ],
    }),
  );

  // Per-category resources
  for (const cat of ['General', 'Business'] as const) {
    const key = cat.toLowerCase();
    server.registerResource(
      `coding-style-${key}`,
      `style://${key}`,
      {
        description: `${cat} coding ${cat === 'Business' ? 'patterns' : 'habits'}`,
        mimeType: 'text/markdown',
      },
      async () => ({
        contents: [
          {
            uri: `style://${key}`,
            mimeType: 'text/markdown',
            text: formatStyleGuide(undefined, cat),
          },
        ],
      }),
    );
  }

  // Per-language resources (Language category only)
  for (const pref of STYLE_PREFERENCES.filter(p => p.category === 'Language')) {
    const lang = pref.language.toLowerCase();
    server.registerResource(
      `coding-style-${lang}`,
      `style://preferences/${lang}`,
      {
        description: `${pref.language} coding style guide`,
        mimeType: 'text/markdown',
      },
      async () => ({
        contents: [
          {
            uri: `style://preferences/${lang}`,
            mimeType: 'text/markdown',
            text: formatStyleGuide(pref.language),
          },
        ],
      }),
    );
  }

  // ------------------------------------------------------------------
  // Tools
  // ------------------------------------------------------------------

  server.registerTool(
    'get_style_guidelines',
    {
      description:
        'Get coding style guidelines — filter by language, category, or both. Returns everything if no filter is specified.',
      inputSchema: z.object({
        language: z
          .string()
          .optional()
          .describe(
            'Filter by language (e.g. TypeScript, React, Vue, Node.js, Go, CSS)',
          ),
        category: z
          .enum(['General', 'Business', 'Language'])
          .optional()
          .describe(
            'Filter by category: General (coding habits), Business (logic patterns), Language (language-specific rules)',
          ),
      }),
    },
    async ({ language, category }) => ({
      content: [{ type: 'text', text: formatStyleGuide(language, category) }],
    }),
  );

  server.registerTool(
    'list_categories',
    {
      description: 'List all style categories and their languages',
    },
    async () => {
      const grouped = new Map<string, string[]>();
      for (const pref of STYLE_PREFERENCES) {
        const list = grouped.get(pref.category) ?? [];
        list.push(pref.language);
        grouped.set(pref.category, list);
      }

      const lines: string[] = [];
      for (const [cat, langs] of grouped) {
        lines.push(`# ${cat}`);
        lines.push(langs.map(l => `  - ${l}`).join('\n'));
      }
      return { content: [{ type: 'text', text: lines.join('\n\n') }] };
    },
  );

  server.registerTool(
    'status',
    {
      description: 'Check the MCP server status and configuration',
    },
    async () => ({
      content: [
        {
          type: 'text',
          text: [
            '✅ style-assistant MCP server is running',
            `📋 ${STYLE_PREFERENCES.length} rule sets configured`,
            `📐 ${STYLE_PREFERENCES.filter(p => p.category === 'General').length} general habits`,
            `🏢 ${STYLE_PREFERENCES.filter(p => p.category === 'Business').length} business patterns`,
            `🔧 ${STYLE_PREFERENCES.filter(p => p.category === 'Language').length} language-specific`,
            `📦 Version: 1.0.0`,
            `🌐 Protocol: MCP 2026-07-28 (Streamable HTTP)`,
          ].join('\n'),
        },
      ],
    }),
  );

  // ------------------------------------------------------------------
  // Prompts
  // ------------------------------------------------------------------

  server.registerPrompt(
    'code-review',
    {
      description: 'Review code against my coding style',
      argsSchema: z.object({
        code: z.string().describe('The code snippet to review'),
        language: z
          .string()
          .optional()
          .describe('Programming language (TypeScript / React / Python, etc.)'),
      }),
    },
    async ({ code, language }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: [
              'Please review this code against my coding style guide:',
              '',
              formatStyleGuide(language),
              '',
              '---',
              'Code to review:',
              '```',
              code,
              '```',
              '',
              "Point out what doesn't match the style guide and suggest improvements.",
            ].join('\n'),
          },
        },
      ],
    }),
  );

  return server;
}
