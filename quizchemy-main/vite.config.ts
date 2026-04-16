import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import https from "https";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), componentTagger()],
  server: {
    port: 8083,
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: true
    },
    // Security headers for development
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
    },
    proxy: {
      '/api': {
        target: 'https://127.0.0.1:8000',
        changeOrigin: true,
        secure: false, // Allow self-signed certificates in development
        ws: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            // Log the outgoing request for debugging
            console.log('Proxying request:', {
              method: proxyReq.method,
              path: proxyReq.path,
              headers: proxyReq.getHeaders()
            });

            // Preserve original headers including Authorization
            Object.keys(req.headers).forEach(key => {
              const value = req.headers[key];
              if (value !== undefined) {
                proxyReq.setHeader(key, value);
              }
            });

            // Handle multipart/form-data properly
            if (req.headers['content-type']?.includes('multipart/form-data')) {
              // Preserve the original content-type with boundary
              const contentType = req.headers['content-type'];
              if (contentType) {
                proxyReq.setHeader('content-type', contentType);
              }
              // Let the body parser handle content-length
              proxyReq.removeHeader('content-length');
            }

            // Ensure we're using HTTPS for the backend
            proxyReq.setHeader('X-Forwarded-Proto', 'https');
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            // Log the response for debugging
            console.log('Received response:', {
              status: proxyRes.statusCode,
              headers: proxyRes.headers
            });
          });
        },
        // Add HTTPS-specific options
        agent: new https.Agent({
          rejectUnauthorized: false // Allow self-signed certificates
        })
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log', 'console.info', 'console.debug'] : []
      }
    },
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'chart-vendor': ['recharts', 'd3'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
        // Asset naming for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Asset optimization
    assetsInlineLimit: 4096, // 4kb
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  optimizeDeps: {
    include: ['docx-preview', 'react-window'],
    exclude: []
  }
});
