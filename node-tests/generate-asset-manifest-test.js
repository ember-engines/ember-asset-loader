var path = require('path');
var assert = require('assert');
var walk = require('walk-sync');
var fs = require('fs-extra');
var broccoli = require('broccoli');

var generateAssetManifest = require('../lib/generate-asset-manifest');

describe('generate-asset-manifest', function() {
  var fixturePath = path.join(__dirname, 'fixtures');
  var manifestsPath = path.join(fixturePath, 'manifests');

  function verifyAssetManifest(manifestName, options) {
    var inputTree = path.join(fixturePath, 'main-test');
    var assetManifestTree = generateAssetManifest(inputTree, options);
    var builder = new broccoli.Builder(assetManifestTree);

    return builder.build().then(function _verifyAssetManifest(results) {
      var output = results.directory;
      var originalFiles = walk(inputTree);
      var outputFiles = walk(output);

      assert.equal(outputFiles.length, originalFiles.length + 1, 'output files has one more file than originally');
      assert.equal(originalFiles.indexOf('asset-manifest.json'), -1, 'original files does not contain an asset manifest');
      assert.notEqual(outputFiles.indexOf('asset-manifest.json'), -1, 'output files does contain an asset manifest');

      var manifestFile = path.join(output, 'asset-manifest.json');
      var manifest = fs.readJsonSync(manifestFile);
      var expectedManifest = fs.readJsonSync(path.join(manifestsPath, manifestName + '.json'));
      assert.deepEqual(manifest, expectedManifest);

      builder.cleanup();
    });
  }

  it('adds an asset manifest to the supplied tree', function() {
    return verifyAssetManifest('full');
  });

  it('adds an asset manifest with custom supportedTypes', function() {
    return verifyAssetManifest('txt', { supportedTypes: [ 'txt' ] });
  });

  it('uses a custom bundlesLocation and properly prepends it to generated URIs', function() {
    return verifyAssetManifest('engines', { bundlesLocation: 'engines-dist' });
  });

  it('merges an existing manifest into the new one', function() {
    var inputTree = path.join(fixturePath, 'existing-test');
    var assetManifestTree = generateAssetManifest(inputTree);
    var builder = new broccoli.Builder(assetManifestTree);

    return builder.build().then(function _verifyAssetManifest(results) {
      var output = results.directory;
      var originalFiles = walk(inputTree);
      var outputFiles = walk(output);

      assert.equal(outputFiles.length, originalFiles.length, 'output files has same number of files as originally');
      assert.notEqual(originalFiles.indexOf('asset-manifest.json'), -1, 'original files does contain an asset manifest');
      assert.notEqual(outputFiles.indexOf('asset-manifest.json'), -1, 'output files does contain an asset manifest');

      var manifestFile = path.join(output, 'asset-manifest.json');
      var manifest = fs.readJsonSync(manifestFile);
      var expectedManifest = fs.readJsonSync(path.join(manifestsPath, 'full-plus-existing.json'));
      assert.deepEqual(manifest, expectedManifest);

      builder.cleanup();
    });
  });
});
