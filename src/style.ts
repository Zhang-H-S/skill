/**
 * Coding style preferences — defined by personal habits and preferences
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
      '  Always work on a feature branch, but never name the branch in the commit message itself',
      '  Keep commits atomic — one logical change per commit',
    ],
  },
  {
    category: 'General',
    language: 'Programming Paradigm',
    rules: [
      "Prefer functional programming. Avoid OOP (classes, 'this', inheritance)",
      'Write closures freely — even wrapping a single local variable is fine',
      "Use pure functions where possible. Prefer immutable data (spread / structuredClone)",
      'Compose small functions over large monolithic ones',
    ],
  },
  {
    category: 'General',
    language: 'TypeScript Usage',
    rules: [
      'Always use TypeScript over plain JS for any serious project',
      'Prefer concrete types. `any` is a lazy escape hatch — use it sparingly',
      'Priority for type representation: union types > enums > plain string',
      'Prefer `interface` over `type` (use `type` for unions and mapped types)',
    ],
  },
  {
    category: 'General',
    language: 'Code Craft & Formatting',
    rules: [
      'Readability over micro-performance. Code is written for humans first',
      'Keep functions focused. Extract logic when it gets too long',
      'Use meaningful names. Chinese comments are fine when context requires',
      '2 spaces for indentation. Semicolons required. Trailing commas everywhere',
      'Double quotes for strings',
      'Single parameter arrow functions: omit parens (e.g. msg => console.log(msg))',
      'camelCase for variables and functions. PascalCase for classes, interfaces, types, component files',
      'kebab-case for CSS class selectors. snake_case for static file names (images, configs)',
    ],
  },

  // ==================================================================
  // 🏢 Business Logic Patterns (placeholder — add your own)
  // ==================================================================
  {
    category: 'Business',
    language: 'General Approach',
    rules: [
      'Keep business logic decoupled from the framework / transport layer',
      'Prefer pure data flow: input → validate → transform → output',
      'Avoid business logic in components or route handlers — extract into services',
      'Handle errors explicitly. Global handler for common cases, local catch for specific recovery',
    ],
  },

  // ==================================================================
  // 🔧 Language-Specific Rules
  // ==================================================================
  {
    category: 'Language',
    language: 'Vue / Nuxt',
    rules: [
      'Use Composition API with <script setup lang="ts">. No Options API',
      'SFC order: <template> → <script setup> → <style scoped>',
      'Use `defineProps<{ prop: Type }>()` with inline type literal for props',
      'Use storeToRefs() to destructure Pinia state, call actions directly on store',
      'Pinia stores: use Setup Store syntax (defineStore("name", () => { ... }))',
      'Use `@/` path alias for project imports',
      'Use `$t("key")` for i18n',
      'Template stays declarative: avoid complex logic, use computed',
    ],
  },
  {
    category: 'Language',
    language: 'React / Next.js',
    rules: [
      'Prefer function components + Hooks. Avoid class components',
      'Keep components pure/presentational, extract logic into custom hooks',
      'Use Tailwind 4, avoid CSS-in-JS',
      'Define Props with interface, place at the top of the file',
      'Default import for components, named import for hooks/utils',
    ],
  },
  {
    category: 'Language',
    language: 'Style & CSS',
    rules: [
      'Use Tailwind 4 utility classes in templates as the primary approach',
      'Configure Tailwind via CSS (@import "tailwindcss") rather than JS config file',
      'Use scoped SCSS for complex custom styles that utilities cannot cover',
      'PC/Mobile responsive: separate view files (pc/ vs mobile/) or component switching via CSS class',
      'Use vw / rem for responsive sizing. Avoid !important',
    ],
  },
  {
    category: 'Language',
    language: 'Node.js / Hono',
    rules: [
      'Use Hono for new projects (lightweight, fast, CF Workers compatible)',
      'Organize by feature (not by file type)',
      'Use middleware for cross-cutting concerns (auth, logging, validation)',
      'Handle all errors through a centralized error handler',
      'Use environment variables for all configuration',
    ],
  },
  {
    category: 'Language',
    language: 'Go',
    rules: [
      'Use `go fmt` before every commit',
      'Prefer composition over inheritance (interfaces, embedding)',
      'Return errors explicitly, avoid panics',
      'Use `errgroup` for concurrent operations',
      'Keep package scope minimal — export only what\'s needed',
    ],
  },
];

// Format style preferences as plain text
export function formatStyleGuide(
  language?: string,
  category?: StylePreference["category"],
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
  const grouped = new Map<StylePreference["category"], StylePreference[]>();
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
