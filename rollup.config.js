import typescript from 'rollup-plugin-typescript';
import pkg from './package.json'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourceMap: true,
    },
    {
      file: pkg.module,
      format: 'es',
      sourceMap: true,
    },
    {
      file: pkg.browser,
      format: 'iife',
      name: 'Orbs',
      sourceMap: true,
      globals: {
        axios: 'axios'
      },
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    typescript()
  ]
}