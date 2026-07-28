/**
 * Coding style preferences — define your own rules here
 */

export interface StylePreference {
  category: 'General' | 'Business' | 'Language';
  language: string;
  rules: string[];
}

export const CATEGORY_LABELS: Record<StylePreference['category'], string> = {
  General: '📐 General Coding Habits',
  Business: '🏢 Business Logic Patterns',
  Language: '🔧 Language-Specific Rules',
};

export const STYLE_PREFERENCES: StylePreference[] = [
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
export function formatStyleGuide(
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
    return `${hint} Available: ${STYLE_PREFERENCES.map(p => p.language).join(', ')}`;
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
      const rules = item.rules.map((r, i) => `  ${i + 1}. ${r}`).join('\n');
      parts.push(`## ${item.language}\n${rules}`);
    }
  }
  return parts.join('\n\n');
}
