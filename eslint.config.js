/**
 * ESLint Flat Configuration for BTS Neural Archive
 * 
 * This uses ESLint's new "flat config" format (eslint.config.js) introduced in ESLint 9.
 * Flat config provides a simpler, more intuitive configuration structure compared to
 * the legacy .eslintrc format.
 * 
 * Benefits of Flat Config:
 * - Single configuration file (no more cascading configs)
 * - Better TypeScript support and type checking
 * - More predictable configuration merging
 * - Easier to understand and debug
 * 
 * Learn more: https://eslint.org/docs/latest/use/configure/configuration-files
 */

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  /**
   * Global Ignores
   * 
   * Files and directories to exclude from linting.
   * Using globalIgnores() ensures these are ignored in all configurations.
   * 
   * - 'dist': Production build output directory
   * - node_modules: Automatically ignored by ESLint
   * - .git: Automatically ignored by ESLint
   * 
   * Additional patterns to consider:
   * - 'coverage': Test coverage reports
   * - '*.config.js': Config files (if you prefer not to lint them)
   * - '.vite': Vite cache directory
   */
  globalIgnores(['dist']),

  /**
   * Main Configuration Object
   * 
   * This configuration applies to all TypeScript and TSX files in the project.
   */
  {
    /**
     * File Patterns
     * 
     * Specifies which files this configuration applies to.
     * Using a glob pattern to match all .ts and .tsx files recursively.
     */
    files: ['**/*.{ts,tsx}'],

    /**
     * Extended Configurations
     * 
     * We extend multiple recommended configurations to get sensible defaults:
     * 
     * 1. js.configs.recommended
     *    - ESLint's core JavaScript rules
     *    - Catches common errors like unused variables, unreachable code
     *    - Provides best practices for JavaScript
     * 
     * 2. tseslint.configs.recommended
     *    - TypeScript-specific linting rules
     *    - Type-aware linting (checks against TypeScript compiler)
     *    - Catches TypeScript-specific issues (type assertions, any usage, etc.)
     *    - Configured by typescript-eslint plugin
     *    - Essential for maintaining type safety in our project
     * 
     * 3. reactHooks.configs.flat.recommended
     *    - Enforces Rules of Hooks (only call at top level, consistent order)
     *    - Prevents common React Hooks mistakes
     *    - Critical for preventing bugs in our useState, useEffect, useMemo usage
     *    - Especially important with React Compiler (compiler relies on correct hooks)
     *    - Examples of what it catches:
     *      ❌ Hooks in conditionals: if (x) { useState(...) }
     *      ❌ Hooks in loops: for (...) { useEffect(...) }
     *      ✅ Correct: useState/useEffect at component top level
     * 
     * 4. reactRefresh.configs.vite
     *    - Ensures Fast Refresh (HMR) compatibility
     *    - Validates that components are Hot Reload compatible
     *    - Prevents patterns that break Fast Refresh in Vite
     *    - Catches issues like:
     *      ❌ Export of non-component values from component files
     *      ❌ Mixing component exports with side effects
     *    - Critical for smooth development experience
     * 
     * Order matters: Configs are applied in sequence, later ones override earlier ones.
     */
    extends: [
      js.configs.recommended,           // Base JavaScript rules
      tseslint.configs.recommended,     // TypeScript rules
      reactHooks.configs.flat.recommended, // React Hooks rules
      reactRefresh.configs.vite,        // Vite Fast Refresh rules
    ],

    /**
     * Language Options
     * 
     * Configures the JavaScript parser and environment globals.
     */
    languageOptions: {
      /**
       * ECMAScript Version
       * 
       * Set to 2020 to support modern JavaScript features like:
       * - Optional chaining (?.)
       * - Nullish coalescing (??)
       * - BigInt
       * - Dynamic import()
       * - globalThis
       * 
       * Matches our tsconfig.json target (ES2022) but ESLint doesn't support
       * ES2022 yet, so we use 2020 which covers most modern syntax.
       */
      ecmaVersion: 2020,

      /**
       * Global Variables
       * 
       * Defines browser APIs as global variables so ESLint doesn't complain
       * about undefined variables like:
       * - window, document, navigator
       * - setTimeout, setInterval, fetch
       * - localStorage, sessionStorage
       * - console, alert, confirm
       * 
       * This prevents false positives when using standard browser APIs
       * throughout the BTS Neural Archive application.
       */
      globals: globals.browser,
    },

    /**
     * Custom Rules (none configured - using defaults)
     * 
     * Uncomment below to add custom rule overrides:
     * 
     * rules: {
     *   // Warn on console.log (prevent accidental console logs in production)
     *   'no-console': ['warn', { allow: ['warn', 'error'] }],
     *   
     *   // Allow any type when necessary (TypeScript)
     *   '@typescript-eslint/no-explicit-any': 'warn',
     *   
     *   // React-specific rules
     *   'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
     * },
     */
  },

  /**
   * Additional Configuration Notes:
   * 
   * This ESLint setup is specifically optimized for:
   * - React 19 with the new React Compiler
   * - TypeScript 5.9 strict mode
   * - Vite 7.2 Fast Refresh
   * - Modern JavaScript (ES2020+)
   * 
   * The combination of these plugins ensures:
   * ✅ Type safety (TypeScript rules)
   * ✅ React best practices (Hooks rules)
   * ✅ Fast Refresh compatibility (React Refresh rules)
   * ✅ Code quality (JavaScript recommended rules)
   * 
   * If you see linting errors:
   * 1. Check if the error is legitimate (fix the code)
   * 2. If it's a false positive, add a rule override above
   * 3. Use // eslint-disable-next-line for one-off exceptions
   * 
   * Running ESLint:
   * - npm run lint          # Check for errors
   * - npm run lint -- --fix # Auto-fix when possible
   */
])
