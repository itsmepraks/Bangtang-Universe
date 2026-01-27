/**
 * Vite Configuration for BTS Neural Archive
 * 
 * This configuration sets up Vite 7.2 with React 19.2, TypeScript 5.9,
 * and Tailwind CSS 4.1, optimized for the cosmic-themed UI.
 * 
 * Official Documentation: https://vite.dev/config/
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    /**
     * Tailwind CSS Plugin (Vite Native)
     * 
     * Integrates Tailwind CSS 4.1 directly into the Vite build pipeline.
     * This new Vite-native integration provides:
     * - Faster build times compared to PostCSS approach
     * - Better HMR (Hot Module Replacement) performance
     * - Automatic CSS optimization and purging
     * - Native Vite caching for improved rebuild speeds
     * 
     * The plugin automatically:
     * - Processes Tailwind directives (@tailwind, @layer, @apply)
     * - Purges unused CSS in production builds
     * - Enables JIT (Just-In-Time) compilation
     * - Optimizes CSS output for performance
     * 
     * Configuration: Tailwind settings are in index.css using @config directive
     * 
     * Documentation: https://tailwindcss.com/docs/guides/vite
     */
    tailwindcss(),

    /**
     * React Plugin with React Compiler (Experimental)
     * 
     * Configures React 19.2 with the new React Compiler (formerly "React Forget").
     * The React Compiler automatically optimizes React components by:
     * 
     * 1. **Automatic Memoization**: 
     *    - Eliminates need for manual useMemo/useCallback in most cases
     *    - Intelligently memoizes component outputs and values
     *    - Reduces unnecessary re-renders automatically
     * 
     * 2. **Performance Optimization**:
     *    - Analyzes component dependencies at compile-time
     *    - Generates optimized code for better runtime performance
     *    - Especially beneficial for the 3D starfield and animation-heavy UI
     * 
     * 3. **Developer Experience**:
     *    - Write cleaner code without manual optimization
     *    - Let the compiler handle performance concerns
     *    - Focus on functionality over micro-optimizations
     * 
     * The compiler runs as a Babel plugin during the build process and:
     * - Transforms component code at build time (not runtime)
     * - Has zero runtime overhead
     * - Works with existing React code (mostly backwards compatible)
     * - Provides warnings for patterns that can't be optimized
     * 
     * Perfect for BTS Neural Archive because:
     * - Heavy animations (800+ stars, bokeh effects, particles)
     * - Complex state management (audio playback, search, member profiles)
     * - Real-time visualizations (waveforms, emotional analysis)
     * - Large datasets (245+ songs with metadata)
     * 
     * Note: This is experimental as of React 19. Monitor console for compiler warnings.
     * 
     * Documentation: https://react.dev/learn/react-compiler
     * Babel Plugin: https://www.npmjs.com/package/babel-plugin-react-compiler
     */
    react({
      babel: {
        plugins: [
          [
            'babel-plugin-react-compiler',
            // Compiler options can be configured here if needed:
            // {
            //   runtimeModule: 'react-compiler-runtime',
            //   sources: (filename) => filename.indexOf('src') !== -1,
            // }
          ]
        ],
      },
    }),
  ],

  /**
   * Additional Configuration Options (currently using defaults):
   * 
   * - server: Development server settings (port, host, proxy)
   * - build: Production build configuration (outDir, minification, sourcemaps)
   * - resolve: Path aliases and module resolution
   * - optimizeDeps: Dependency pre-bundling configuration
   * - css: CSS-specific options
   * 
   * Examples of common configurations:
   * 
   * ```typescript
   * resolve: {
   *   alias: {
   *     '@': '/src',
   *     '@components': '/src/components',
   *     '@utils': '/src/utils',
   *   }
   * },
   * 
   * server: {
   *   port: 5173,
   *   open: true, // Auto-open browser
   * },
   * 
   * build: {
   *   sourcemap: false, // Disable sourcemaps in production
   *   chunkSizeWarningLimit: 1000, // Increase limit for large bundles
   * }
   * ```
   * 
   * For now, we rely on sensible Vite defaults which work well for this project.
   */
})
