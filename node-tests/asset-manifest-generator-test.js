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
    function verifyAssetManifest(manifestName, options, existingManifest) {
      var inputTrees = [ path.join(fixturePath, 'main-test', 'bundles') ];

      if (existingManifest) {
        inputTrees.push(existingManifest);
      }

      var generator = new AssetManifestGenerator(inputTrees, options);
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
      return verifyAssetManifest('full', { prepend: '/bundles/' });
    });

    it('handles custom supportedTypes', function() {
      return verifyAssetManifest('txt', { prepend: '/bundles/', supportedTypes: [ 'txt' ] });
    });

    it('prepends custom paths to the generated uris', function() {
      return verifyAssetManifest('resources', { prepend: '/resources/' });
    });

    it('merges with an existing manifest', function() {
      var existingManifest = path.join(manifestsPath, 'existing');
      return verifyAssetManifest('full-plus-existing', { prepend: '/bundles/' }, existingManifest);
    });

    it('throws an error when a bundle collision occurs', function() {
      var existingManifest = path.join(manifestsPath, 'existing-collision');
      var inputTrees = [ path.join(fixturePath, 'main-test', 'bundles'), existingManifest ];
      var generator = new AssetManifestGenerator(inputTrees);
      var builder = new broccoli.Builder(generator);

      return builder.build().then(function() {}, function(reason) {
        assert.ok(reason.toString().indexOf('Attempting to add bundle "blog" to manifest but a bundle with that name already exists.') !== -1);
      });
    });
  });
});
