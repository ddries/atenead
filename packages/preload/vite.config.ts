import { builtinModules } from 'module'
import { defineConfig } from 'vite'
import pkg from '../../package.json'

export default defineConfig({
  root: __dirname,
  build: {
    outDir: '../../dist/preload',
    emptyOutDir: true,
    lib: {
      entry: 'index.ts',
      formats: ['cjs'],
      fileName: () => '[name].cjs',
    },
    minify: true,
    // https://github.com/caoxiemeihao/electron-vue-vite/issues/61
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
