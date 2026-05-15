import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'core/index': 'src/core/index.ts',
    'react/index': 'src/react/index.ts',
  },
  format: ['esm', 'cjs'],
  outExtension({ format }) {
    if (format === 'esm') return { js: '.mjs', dts: '.d.ts' };
    if (format === 'cjs') return { js: '.cjs', dts: '.d.cts' };
    return {};
  },
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  external: ['react', 'react-dom', 'lucide-react'],
});
