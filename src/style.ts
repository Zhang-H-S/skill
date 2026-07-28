/**
 * Coding style preferences — sourced from real project code at
 * jackpot-crush-fe (Nuxt 3 + TypeScript + UnoCSS)
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
      "Use pure functions where possible (no side effects). Prefer immutable data (spread / structuredClone)",
      'Compose small functions over large monolithic ones',
    ],
  },
  {
    category: 'General',
    language: 'TypeScript Usage',
    rules: [
      'Always use TypeScript over plain JS for any serious project',
      "strict: false in tsconfig is acceptable — pragmatism over purity",
      'Prefer concrete types. `any` is a lazy escape hatch — use it sparingly and only when the shape is truly dynamic',
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
      'Use meaningful names. Chinese comments are fine for internal project context',
      '2 spaces for indentation. Semicolons required. Trailing commas everywhere',
      'Double quotes for strings (both in TS and template attributes)',
      'Single parameter arrow functions: omit parens (e.g. msg => console.log(msg))',
      'camelCase for variables and functions. PascalCase for classes, interfaces, types, component files',
      'kebab-case for CSS class selectors. snake_case for static file names (images, configs)',
      'Barrel exports: use index.ts with `export * from "./module"` pattern',
    ],
  },

  // ==================================================================
  // 🏢 Business Logic Patterns
  // ==================================================================
  {
    category: 'Business',
    language: 'Project Architecture',
    rules: [
      'Organize by file type at top level (components/, pages/, utils/, api/, stores/, types/)',
      'Within each directory, group by business domain in subdirectories (e.g. components/shop/, pages/main/)',
      'Use barrel exports (index.ts) to consolidate related modules',
      'Keep reusable logic in utils/ instead of composables/ — auto-imported via nuxt.config imports.dirs',
    ],
  },
  {
    category: 'Business',
    language: 'API Layer',
    rules: [
      'Create a shared $fetch instance with baseURL for all API calls',
      'Handle global errors (like network errors) in the instance interceptor with a toast/message',
      'Wrap each API endpoint in a typed function in api/ (e.g. api/shop.ts, api/payment.ts)',
      'GET requests use `params`, POST/PUT use `body`',
      'API responses can be typed loosely (e.g. `res: any`) when the shape varies — no over-engineering',
    ],
  },
  {
    category: 'Business',
    language: 'Error Handling',
    rules: [
      'Global error handler for common cases (network error → toast message)',
      'Local catch for specific error recovery (e.g. track failure event)',
      'Use .catch() and .finally() for cleanup (e.g. reset loading state)',
      'Display user-friendly messages — never raw error codes',
    ],
  },

  // ==================================================================
  // 🔧 Language-Specific Rules
  // ==================================================================
  {
    category: 'Language',
    language: 'Vue / Nuxt',
    rules: [
      'Use Composition API with <script setup lang="ts">',
      'Use $fetch (ofetch) for data fetching — avoid axios',
      'Auto-imported APIs: useShopsStore(), useI18n(), useRoute(), useRouter(), useHead() — no explicit imports needed',
      'Route middleware: use .global.ts suffix for global guards (e.g. guard.global.ts)',
      'Use `definePageMeta()` + `useHead()` at the end of each page <script>',
      'Extract page-specific logic into co-located hooks.ts / composables in the same directory',
      'Use `defineProps<{ prop: Type }>()` with inline type literal — clean and concise',
      'Use `defineEmits<{ (e: "name", payload: Type): void }>()` with type syntax',
      'Use storeToRefs() to destructure Pinia state without losing reactivity',
      'Pinia stores: use Setup Store syntax (defineStore("name", () => { ... }))',
      'SFC order: <template> → <script setup> → <style scoped>',
      'Script order: imports → auto-imported hooks → ref/reactive → defineProps/emits → computed/watch → functions → lifecycle → useHead/definePageMeta',
    ],
  },
  {
    category: 'Language',
    language: 'React / Next.js',
    rules: [
      'Prefer function components + Hooks. Avoid class components',
      'Keep components pure/presentational, extract logic into custom hooks',
      'Use Tailwind, avoid CSS-in-JS',
      'Define Props with interface, place at the top of the file',
      'Default import for components, named import for hooks/utils',
    ],
  },
  {
    category: 'Language',
    language: 'Style & CSS',
    rules: [
      'Use Tailwind 4 utility classes in templates as the primary styling approach',
      'Configure Tailwind via CSS (@import "tailwindcss") rather than JS config file',
      'Use scoped SCSS for complex custom styles that utilities cannot cover',
      'PC/Mobile responsive design: toggle a root class (.pc / .mobile) and nest styles',
      'Use vw / rem for responsive sizing. CSS custom properties for theme tokens',
      'Nested SCSS selectors are welcome (.parent { .child { } }). Avoid !important',
      'Background images via CSS background-image with contain/cover',
    ],
  },
  {
    category: 'Language',
    language: 'SolidJS',
    rules: [
      "Use signals and effects, avoid classes and 'this'",
      'Prefer `createSignal` over mutable state',
      'Use `<For>` / `<Show>` control flow components instead of .map() / &&',
      'Default import for components',
      'Keep component logic in primitives (custom hooks)',
    ],
  },
  {
    category: 'Language',
    language: 'Astro',
    rules: [
      'Use `---` frontmatter for server-side logic',
      'Minimal client JS — use client:* directives sparingly',
      'Colocate components with their Astro pages when possible',
      'Prefer `.astro` over `.mdx` for content-heavy pages with custom layout',
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
      'Named imports for utilities and middleware',
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
