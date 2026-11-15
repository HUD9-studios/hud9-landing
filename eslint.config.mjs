import js from '@eslint/js';
import next from '@next/eslint-plugin-next';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import reactHooks from 'eslint-plugin-react-hooks';
import typescript from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'dist/**',
    'next-env.d.ts',
  ]),
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx,mts,cts,jsx}'],
    extends: [
      typescript.configs.recommended,
      next.configs['core-web-vitals'],
      reactHooks.configs.flat.recommended,
    ],
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: { console: 'readonly', process: 'readonly' } },
  },
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'],
    rules: {
      complexity: ['error', 12],
      'max-lines': [
        'error',
        { max: 300, skipBlankLines: true, skipComments: true },
      ],
      'max-lines-per-function': [
        'error',
        { max: 60, skipBlankLines: true, skipComments: true },
      ],
      'no-duplicate-imports': ['error', { allowSeparateTypeImports: true }],
    },
  },
  prettier,
]);
