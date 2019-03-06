import AssetLoadError from 'ember-asset-loader/errors/asset-load';
import { module, test } from 'qunit';

module('Unit | Error | asset-load', {
  asset: {
    type: 'js',
    uri: 'some-js-file.js'
  },
  loader: {
    loadAsset(asset) {
      return `Loaded ${asset.type} asset with uri "${asset.uri}".`;
    }
  },
  originalError: new Error('some error')
});

test('constructor() - accepts an asset and the original error', function(assert) {
  const error = new AssetLoadError(this.loader, this.asset, this.originalError);
  assert.ok(error instanceof Error, 'AssetLoadError inherits Error');
  assert.ok(error.stack, 'stack is preserved');
  assert.strictEqual(error.asset, this.asset, 'asset is set');
});

test('toString() - has correct name and message', function(assert) {
  const error = new AssetLoadError(this.loader, this.asset, this.originalError);
  assert.equal(error.toString(), 'AssetLoadError: The js asset with uri "some-js-file.js" failed to load with the error: Error: some error.');
});

test('retryLoad() - calls loadAsset on the loader', function(assert) {
  const error = new AssetLoadError(this.loader, this.asset, this.originalError);
  assert.equal(error.retryLoad(), 'Loaded js asset with uri "some-js-file.js".');
});
