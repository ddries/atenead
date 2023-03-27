import { builtinModules } from 'module'
import { defineConfig } from 'vite'
import pkg from '../../package.json'

export default defineConfig({
  root: __dirname,
  build: {
    outDir: '../../dist/main',
    emptyOutDir: true,
    lib: {
      entry: 'index.ts',
      formats: ['cjs'],
      fileName: () => '[name].cjs',
    },
    minify: true,
    sourcemap: false,
    rollupOptions: {
      external: [
        'electron',
        ...builtinModules,
        ...Object.keys(pkg.dependencies || {}),
      ],
    },
  },

  plugins: [
  ]
})
