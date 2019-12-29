const eq = require('assert').strictEqual;
const notEq = require('assert').notStrictEqual;
const rollup = require('rollup').rollup;
const runInNewContext = require('vm').runInNewContext;
const stub = require('../');

describe('stub', () => {
  it('allows stubbing exported variables', () => {
    return rollup({
      input: 'test/examples/exported-var/main.js',
      plugins: [
        stub({ include: 'test/examples/**/*.js' })
      ]
    })
  });

  it('allows stubbing exported function declarations', async () => {
    const bundle = await rollup({
      input: 'test/examples/exported-function/main.js',
      plugins: [
        stub({ include: 'test/examples/**/*.js' })
      ]
    })
    const result = await bundle.generate({ format: 'cjs' });
    const exports = {};
    const module = { exports };
    runInNewContext(result.output[0].code, { module, exports });
    eq(module.exports.fnBeforeStub(), 0);
    eq(module.exports.fnAfterStub(), 42);
  });

  it('allows stubbing exported function declarations that rely on hoisting', async () => {
    const bundle = await rollup({
      input: 'test/examples/exported-function-hoisted/main.js',
      plugins: [
        stub({ include: 'test/examples/**/*.js' })
      ]
    })
    const result = await bundle.generate({ format: 'cjs' });
    const exports = {};
    const module = { exports };
    runInNewContext(result.output[0].code, { module, exports });
    eq(module.exports.fnBeforeStub(), 0);
    eq(module.exports.fnAfterStub(), 42);
  });

  it('allows stubbing exported const declarations', async () => {
    const bundle = await rollup({
      input: 'test/examples/const/main.js',
      plugins: [
        stub({ include: 'test/examples/**/*.js' })
      ]
    })
    const result = await bundle.generate({ format: 'cjs' });
    const exports = {};
    const module = { exports };
    runInNewContext(result.output[0].code, { module, exports });
    eq(module.exports.PIBeforeStub, 3.14);
    eq(module.exports.PIAfterStub, 999);
  });

  it('allows resetting stubbed values', async () => {
    const bundle = await rollup({
      input: 'test/examples/reset-stub/main.js',
      plugins: [
        stub({ include: 'test/examples/**/*.js' })
      ]
    })
    const result = await bundle.generate({ format: 'cjs' });
    const exports = {};
    const module = { exports };
    runInNewContext(result.output[0].code, { module, exports });
    eq(module.exports.oneBeforeStub, 1);
    eq(module.exports.oneAfterStub, 734);
    eq(module.exports.oneAfterReset, 1);
  });

  it('does not throw on `export {varName as default}``', () => {
    return rollup({
      input: 'test/examples/export-default-brackets/main.js',
      plugins: [
        stub({ include: 'test/examples/export-default-brackets/main.js' })
      ]
    });
  });

  describe('Class stubbing', () => {
    it('allows stubbing exported Class declarations', async () => {
      const bundle = await rollup({
        input: 'test/examples/exported-class/main.js',
        plugins: [
          stub({ include: 'test/examples/exported-class/*.js' })
        ]
      })
      const result = await bundle.generate({ format: 'cjs' });
      const exports = {};
      const module = { exports };
      runInNewContext(result.output[0].code, { module, exports });

      const testClassInstace = new module.exports.ClassBeforeStub();
      const stubClassInstace = new module.exports.ClassAfterStub();

      eq(testClassInstace.getTest(), 0);
      eq(stubClassInstace.getTest(), 42);
    });

    it('allows resetting stubbed Class declarations', async () => {
      const bundle = await rollup({
        input: 'test/examples/exported-class/main.js',
        plugins: [
          stub({ include: 'test/examples/exported-class/*.js' })
        ]
      })
      const result = await bundle.generate({ format: 'cjs' });
      const exports = {};
      const module = { exports };
      runInNewContext(result.output[0].code, { module, exports });

      const testClassInstace = new module.exports.ClassBeforeStub();
      const resetClassInstace = new module.exports.ClassAfterReset();

      eq(testClassInstace.getTest(), 0);
      eq(resetClassInstace.getTest(), 0);
    });

    it('stubbed Class is different from the original', async () => {
      const bundle = await rollup({
        input: 'test/examples/exported-class/main.js',
        plugins: [
          stub({ include: 'test/examples/exported-class/*.js' })
        ]
      })
      const result = await bundle.generate({ format: 'cjs' });
      const exports = {};
      const module = { exports };
      runInNewContext(result.output[0].code, { module, exports });

      notEq(module.exports.ClassBeforeStub, module.exports.ClassAfterStub);
    });

    it('reset stubbed Class is exactly the same as original', async () => {
      const bundle = await rollup({
        input: 'test/examples/exported-class/main.js',
        plugins: [
          stub({ include: 'test/examples/exported-class/*.js' })
        ]
      });
      const result = await bundle.generate({ format: 'cjs' });
      const exports = {};
      const module = { exports };
      runInNewContext(result.output[0].code, { module, exports });

      eq(module.exports.ClassBeforeStub, module.exports.ClassAfterReset);
    });
  });
});
