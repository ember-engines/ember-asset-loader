import LoadError from 'ember-asset-loader/errors/load';
import { module, test } from 'qunit';

module('Unit | Error | load');

test('constructor() - accepts a message and a loader', function(assert) {
  const message = 'herp-de-derp';
  const loader = {};
  const error = new LoadError(message, loader);

  assert.ok(error instanceof Error, 'LoadError inherits Error');
  assert.ok(error.stack, 'stack is preserved');
  assert.equal(error.message, message, 'message is set');
  assert.strictEqual(error.loader, loader, 'loader is set');
});

test('toString() - has correct name and message', function(assert) {
  const error = new LoadError('herp-de-derp');
  assert.equal(error.toString(), 'LoadError: herp-de-derp');
});

test('retryLoad() - throws an error', function(assert) {
  const error = new LoadError();
  assert.throws(() => error.retryLoad(), /You must define a behavior for 'retryLoad' in a subclass./);
});
