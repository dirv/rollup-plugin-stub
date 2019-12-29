let pkg = require('./package.json');

export default {
  input: 'index.js',
  external: Object.keys(pkg.dependencies),
  plugins: [],
  output: [
    { file: pkg.module, format: 'es' },
    { file: pkg.main, format: 'cjs' }
  ]
};
