import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import path from 'path';

const devHost = process.env.VITE_DEV_SERVER_HOST || 'localhost';
const devPort = Number(process.env.VITE_DEV_SERVER_PORT || 5173);

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@shared': path.resolve(__dirname, 'src/shared')
      }
    },
    build: {
      rollupOptions: {
        input: path.join(__dirname, 'src/main/index.ts'),
        output: {
          entryFileNames: 'index.cjs',
          format: 'cjs'
        }
      },
      outDir: 'dist/main'
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@shared': path.resolve(__dirname, 'src/shared')
      }
    },
    build: {
      rollupOptions: {
        input: path.join(__dirname, 'src/preload/index.ts'),
        output: {
          entryFileNames: 'index.cjs',
          format: 'cjs'
        }
      },
      outDir: 'dist/preload'
    }
  },
    renderer: {
    root: path.join(__dirname, 'src/renderer'),
    resolve: {
      alias: {
        '@renderer': path.resolve(__dirname, 'src/renderer'),
        '@shared': path.resolve(__dirname, 'src/shared')
      }
    },
    build: {
      rollupOptions: {
        input: path.join(__dirname, 'src/renderer/index.html')
      },
      outDir: 'dist/renderer'
    },
    server: {
      host: devHost,
      port: devPort
    }
  }
});
