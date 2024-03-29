import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import resolve from 'vite-plugin-resolve'
import electron from 'vite-plugin-electron-renderer'
import pkg from '../../package.json'

// https://vitejs.dev/config/
export default defineConfig({
  mode: process.env.NODE_ENV,
  root: __dirname,
  plugins: [
    vue(),
    electron(),
    resolve(
      /**
       * Here you can specify other modules
       * 🚧 You have to make sure that your module is in `dependencies` and not in the` devDependencies`,
       *    which will ensure that the electron-builder can package it correctly
       */
      {
        // If you use electron-store, this will work
        'electron-store': 'const Store = require("electron-store"); export default Store;',
      }
    ),
  ],
  base: './',
  build: {
    sourcemap: false,
    outDir: '../../dist/renderer',
    emptyOutDir: true
  },
  server: {
    host: pkg.env.VITE_DEV_SERVER_HOST,
    port: pkg.env.VITE_DEV_SERVER_PORT,
  },
})
