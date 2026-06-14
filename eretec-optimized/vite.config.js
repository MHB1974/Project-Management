import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Project-Management/',
  plugins: [
    react({
      jsxRuntime: 'automatic',
      babel: {
        plugins: [
          ['@babel/plugin-proposal-class-properties', { loose: true }],
        ],
      },
    }),
  ],
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Firebase를 별도 청크로 분리 (캐싱 효율)
          firebase: ['firebase/app', 'firebase/database', 'firebase/auth'],
          // React와 React-DOM을 vendor 청크로
          vendor: ['react', 'react-dom'],
        },
        // 에셋 파일명 최적화
        entryFileNames: 'assets/[name]-[hash:8].js',
        chunkFileNames: 'assets/[name]-[hash:8].js',
        assetFileNames: 'assets/[name]-[hash:8][extname]',
      },
    },
    // 청크 크기 최적화
    chunkSizeWarningLimit: 500,
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
    outDir: 'dist',
    emptyOutDir: true,
  },
  // 개발 환경 최적화
  server: {
    middlewareMode: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
  },
  // 성능 최적화
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  // 캐시 전략
  cacheDir: '.vite',
  optimizeDeps: {
    include: ['react', 'react-dom', 'firebase/app'],
  },
});
