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
      'Handle global network errors in the instance interceptor with a toast/message',
      'Wrap each API endpoint in a typed function in service/api/ (e.g. api/token.ts)',
      'GET requests use params, POST/PUT use body',
      'API responses can be typed loosely — only type what you actually use',
      'Use // @ts-ignore for truly unstable API fields (legacy API compatibility)',
    ],
  },
  {
    category: 'Business',
    language: 'Error Handling',
    rules: [
      'Global toast for common network errors (via interceptor)',
      'Local .catch() for specific error recovery (e.g. track failure event, log to server)',
      'Use .catch(e => console.log(e)) for simple logging in utility fetches',
      'Use .finally() for cleanup (reset loading state)',
      'Send detailed failure reports to server for payment-critical flows',
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
      'SFC order: <template> → <script lang="ts" setup> → <style lang="scss" scoped>',
      'Script order: imports → auto-imported hooks → ref/reactive → defineProps/emits → computed/watch → functions → lifecycle → page meta',
      'Use `defineProps<{ prop: Type }>()` with inline type literal for props',
      'Use `defineEmits(["event"])` with array string for simple emits, or type syntax `(e: "name", p: T): void` for complex ones',
      'Emit camelCase in child, listen kebab-case in parent (@close, @payment)',
      'Use storeToRefs() to destructure Pinia state, call actions directly on store',
      'Pinia stores: use Setup Store syntax (defineStore("name", () => { ... }))',
      'Auto-imported: useI18n(), useRoute(), useRouter(), useHead(), Pinia stores — no explicit imports if configured',
      'Extract page logic into co-located hooks/ directory, create an orchestrator hook that composes sub-hooks',
      'Naming: useXxx for composables, plain names for configs/constants (priceConfig.ts, loadImg.ts)',
      'Prefer @/ path alias for all imports (e.g. @/store/page, @/service/api/token)',
      'Use $t("key") for i18n. Language-aware images via objects { zh, en, ja } + pickImg()',
      'Template stays declarative: avoid complex logic, use computed. v-if/v-for with :key always',
      'Use Promise .then() chains as the primary async pattern over async/await',
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
      'Use Tailwind 4 utility classes in templates as the primary approach',
      'Configure Tailwind via CSS (@import "tailwindcss") rather than JS config file',
      'Use scoped SCSS for complex custom styles that utilities cannot cover',
      'PC/Mobile responsive: separate view files (pc/ vs mobile/), or same component with .pc/.mobile CSS class switching',
      'Use BEM-like naming for CSS classes: .tokenItem, .header, .board, .btn',
      'CSS background-image for most UI elements (buttons, badges, panels, borders) — not CSS-drawn',
      'Text stroke effects via CSS pseudo-elements and data-text attribute',
      'Use vw for responsive sizing. Scoped styles with nested selectors',
      'Avoid !important — use more specific selectors instead',
      'Language/device style overrides: .pc_zh, .pc_en, .mobile_ja naming convention',
    ],
  },
  {
    category: 'Language',
    language: 'PC/Mobile Architecture',
    rules: [
      'Separate view files for PC and Mobile (tokenStorePC.vue / tokenStoreMobile.vue)',
      'Keep all hooks/composables shared — never split by device',
      'Component split: share if CSS-only differences, split into PC/Mobile versions if structure differs substantially',
      'Image resources: separate loadImg.ts per device (pc/loadImg.ts, mobile/loadImg.ts)',
      'Use orchestrator hook pattern: a main useXxx() that composes smaller useXxx() sub-hooks',
      'No @media queries — use device-based route dispatching instead',
      'Organize components by feature: modals/dailyGift/, modals/pass/, carousel/, tokenItem/',
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
