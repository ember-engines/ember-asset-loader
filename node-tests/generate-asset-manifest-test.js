var path = require('path');
var assert = require('assert');
var walk = require('walk-sync');
var fs = require('fs-extra');
var broccoli = require('broccoli');

var generateAssetManifest = require('../lib/generate-asset-manifest');

describe('generate-asset-manifest', function() {
  var fixturePath = path.join(__dirname, 'fixtures');
  var manifestsPath = path.join(fixturePath, 'manifests');

  function verifyAssetManifest(manifestName, supportedTypes, prepend) {
    var inputTree = path.join(fixturePath, 'main-test');
    var assetManifestTree = generateAssetManifest(inputTree, supportedTypes, prepend);
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
    return verifyAssetManifest('txt', [ 'txt' ]);
  });

  it('adds an asset manifest with a custom prepended path', function() {
    return verifyAssetManifest('resources', undefined, '/resources/');
  });
});
