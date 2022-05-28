import BundleLoadError from 'ember-asset-loader/errors/bundle-load';
import { module, test } from 'qunit';

module('Unit | Error | bundle-load', function (hooks) {
  hooks.beforeEach(function () {
    this.bundleName = 'herp-de-derp';

    this.errors = [new Error('derp error')];

    this.loader = {
      loadBundle(bundleName) {
        return `Loaded the bundle "${bundleName}".`;
      },
    };
  });

  test('constructor() - accepts a bundleName and errors array', function (assert) {
    const error = new BundleLoadError(
      this.loader,
      this.bundleName,
      this.errors
    );
    assert.ok(error instanceof Error, 'BundleLoadError inherits Error');
    assert.ok(error.stack, 'stack is preserved');
    assert.strictEqual(error.bundleName, this.bundleName, 'bundleName is set');
    assert.strictEqual(error.errors, this.errors, 'errors is set');
  });

  test('toString() - has correct name and message', function (assert) {
    const error = new BundleLoadError(
      this.loader,
      this.bundleName,
      this.errors
    );
    assert.strictEqual(
      error.toString(),
      'BundleLoadError: The bundle "herp-de-derp" failed to load.'
    );
  });

  test('retryLoad() - calls loadBundle on the loader', function (assert) {
    const error = new BundleLoadError(
      this.loader,
      this.bundleName,
      this.errors
    );
    assert.strictEqual(error.retryLoad(), 'Loaded the bundle "herp-de-derp".');
  });
});
