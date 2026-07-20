import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

// One flat config for the whole monorepo. ESLint ignores node_modules on its own;
// we add build output and generated files below.
export default tseslint.config(
  { ignores: ['**/dist/**', '**/.turbo/**'] },

  // Base JS + TypeScript recommended rules (recommended already bans `any`).
  js.configs.recommended,
  tseslint.configs.recommended,

  // Our TypeScript source across every package.
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // Force `import type { … }` for type-only imports (matches our types policy
      // and the verbatimModuleSyntax compiler setting).
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },

  // React-specific rules, only for component files.
  {
    files: ['**/*.tsx'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
);
