import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({

    base: '/iare/',

    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            'tapestry-parser': path.resolve(
                __dirname,
                '../tapestry-parser/src/index.js',
            ),
        },
    },

    build: {
        outDir: 'dist',  /// changed from "/build"
        sourcemap: true, // Generates source maps for debugging;
        // sourcemap: "hidden" // Keeps source maps but hides them from DevTools;
        rollupOptions: {
            input: 'index.html'
        }
    },

    plugins: [
        react(),
        svgr({ svgrOptions: { icon: true } }),
    ],

    server: {
        port: 3000, // Optional: Change port if needed
        open: true,
        fs: { allow: ['..', '/Users/chris/_jobs/archive.org/tapestry-parser'] },
    },

    css: {
        preprocessorOptions: {
            scss: {
                quietDeps: true  // suppress deprecation warnings (mostly from sass/bootstrap)
            }
        },
        devSourcemap: true, // ensures CSS sourcemaps in dev
    }

    // esbuild: {
    //     loader: "jsx",
    //     include: /src\/.*\.js$/,
    //     exclude: [],
    // },
    // optimizeDeps: {
    //     esbuildOptions: {
    //         loader: { ".js": "jsx" },
    //     },
    // },

});
