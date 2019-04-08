import BundleLoadError from 'ember-asset-loader/errors/bundle-load';
import { module, test } from 'qunit';

module('Unit | Error | bundle-load', {
  bundleName: 'herp-de-derp',
  errors: [
    new Error('derp error')
  ],
  loader: {
    loadBundle(bundleName) {
      return `Loaded the bundle "${bundleName}".`;
    }
  }
});

test('constructor() - accepts a bundleName and errors array', function(assert) {
  const error = new BundleLoadError(this.loader, this.bundleName, this.errors);
  assert.ok(error instanceof Error, 'BundleLoadError inherits Error');
  assert.ok(error.stack, 'stack is preserved');
  assert.equal(error.bundleName, this.bundleName, 'bundleName is set');
  assert.strictEqual(error.errors, this.errors, 'errors is set');
});

test('toString() - has correct name and message', function(assert) {
  const error = new BundleLoadError(this.loader, this.bundleName, this.errors);
  assert.equal(error.toString(), 'BundleLoadError: The bundle "herp-de-derp" failed to load.');
});

test('retryLoad() - calls loadBundle on the loader', function(assert) {
  const error = new BundleLoadError(this.loader, this.bundleName, this.errors);
  assert.equal(error.retryLoad(), 'Loaded the bundle "herp-de-derp".');
});
