import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: true,
    watch: {
      usePolling: true, // Use polling if file changes are not detected
    },
    host: '0.0.0.0', // Ensure the server runs on localhost
    port: 3000,      // Optional: Change the port if needed
  },
  build: {
    commonjsOptions: {
      ignoreTryCatch: false, // Prevent warnings from CommonJS modules
    },
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress 'use client' warnings
        if (warning.message.includes("'use client' was ignored")) {
          return;
        }
        warn(warning);
      },
    },
  },
});