import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: true,
    watch: {
      usePolling: true, // Use polling if file changes are not detected
    },
    https: {
      key: '../certs/server-key.pem', // Relative path to your private key
      cert: '../certs/server-cert.pem', // Relative path to your certificate
    },
    host: '0.0.0.0', // Ensure the server runs on localhost
    port: 3000,        // Optional: Change the port if needed
  },
});