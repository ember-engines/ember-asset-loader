var path = require('path');
var assert = require('assert');
var walk = require('walk-sync');
var fs = require('fs-extra');
var broccoli = require('broccoli');

var AssetManifestGenerator = require('../lib/asset-manifest-generator');

describe('asset-manifest-generator', function() {
  var fixturePath = path.join(__dirname, 'fixtures');
  var manifestsPath = path.join(fixturePath, 'manifests');

  describe('build', function() {
    function verifyAssetManifest(manifestName, options) {
      var inputTree = path.join(fixturePath, 'main-test', 'assets');
      var generator = new AssetManifestGenerator(inputTree, options);
      var builder = new broccoli.Builder(generator);

      return builder.build().then(function _verifyAssetManifest(results) {
        var output = results.directory;
        assert.deepEqual(walk(output), [ 'asset-manifest.json' ], 'the asset manifest should be the only output');

        var manifestFile = path.join(output, 'asset-manifest.json');
        var manifest = fs.readJsonSync(manifestFile);
        var expectedManifest = fs.readJsonSync(path.join(manifestsPath, manifestName + '.json'));
        assert.deepEqual(manifest, expectedManifest);

        builder.cleanup();
      });
    }

    it('generates an asset manifest from an input tree', function() {
      return verifyAssetManifest('full');
    });

    it('handles custom supportedTypes', function() {
      return verifyAssetManifest('txt', { supportedTypes: [ 'txt' ] });
    });

    it('prepends custom paths to the generated uris', function() {
      return verifyAssetManifest('resources', { prepend: '/resources/' });
    });
  });
});
