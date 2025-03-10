import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// import fs from 'fs/promises';

export default defineConfig({
    build: {
        outDir: 'build',
    },

    plugins: [
        react(),
        svgr({ svgrOptions: { icon: true } }),
    ],

    server: {
        port: 3000, // Optional: Change port if needed
        open: true,
    },

    css: {
        preprocessorOptions: {
            scss: {
                quietDeps: true  // suppress deprecation warnings (mostly from sass/bootstrap
            }
        }
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

    // resolve: {
    //     alias: {
    //         '@': path.resolve(__dirname, 'src'), // Alias '@' to the 'src' directory
    //     },
    // },
});