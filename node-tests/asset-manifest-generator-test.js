'use strict';

var path = require('path');
var assert = require('assert');
var fs = require('fs-extra');
var co = require('co');

const helpers = require('broccoli-test-helper');
const createBuilder = helpers.createBuilder;
const createTempDir = helpers.createTempDir;

var AssetManifestGenerator = require('../lib/asset-manifest-generator');

describe('asset-manifest-generator', function() {
  let input;
  let output;

  beforeEach(co.wrap(function* () {
    input = yield createTempDir();
  }));

  afterEach(co.wrap(function* () {
    yield input.dispose();
    yield output.dispose();
  }));

  var fixturePath = path.join(__dirname, 'fixtures');
  var manifestsPath = path.join(fixturePath, 'manifests');

  describe('build', function() {
    let verifyAssetManifest = co.wrap(function* verifyAssetManifest(manifestName, options, existingManifest) {
      var inputTrees = [ path.join(fixturePath, 'main-test', 'bundles') ];

      if (existingManifest) {
        inputTrees.push(existingManifest);
      }

      var generator = new AssetManifestGenerator(inputTrees, options);
      output = createBuilder(generator);

      yield output.build();


      let entries = Object.keys(output.read());
      assert.deepEqual(entries, ['asset-manifest.json'], 'only contains `asset-manifest.json`');

      let actualManifest = fs.readJsonSync(output.path('asset-manifest.json'));
      var expectedManifest = fs.readJsonSync(path.join(manifestsPath, manifestName + '.json'), 'utf-8');

      assert.deepEqual(actualManifest, expectedManifest, 'the asset manifest should be the only output');
    });

    it('generates an asset manifest from an input tree', function() {
      return verifyAssetManifest('full', { prepend: '/bundles' });
    });

    it('handles custom supportedTypes', function() {
      return verifyAssetManifest('txt', { prepend: '/bundles/', supportedTypes: [ 'txt' ] });
    });

    it('prepends custom paths to the generated uris', function() {
      return verifyAssetManifest('resources', { prepend: '/resources/' });
    });

    it('can ignore specific files', function() {
      return verifyAssetManifest('full-minus-ignored-files', {
        prepend: '/bundles',
        filesToIgnore: [ 'blog/assets/engine.css', 'chat/assets/engine.js' ]
      });
    });

    it('can ignore specific files using regex', function() {
      return verifyAssetManifest('full-minus-ignored-files', {
        prepend: '/bundles',
        filesToIgnore: [ /(blog\/assets\/engine\.css|chat\/assets\/engine\.js)/ ]
      });
    });

    it('merges with an existing manifest', function() {
      var existingManifest = path.join(manifestsPath, 'existing');
      return verifyAssetManifest('full-plus-existing', { prepend: '/bundles' }, existingManifest);
    });

    it('throws an error when a bundle collision occurs', function() {
      var existingManifest = path.join(manifestsPath, 'existing-collision');
      var inputTrees = [ path.join(fixturePath, 'main-test', 'bundles'), existingManifest ];
      var generator = new AssetManifestGenerator(inputTrees);
      output = createBuilder(generator);

      return output.build().then(null, (reason) => {
        assert.ok(reason.toString().indexOf('Attempting to add bundle "blog" to manifest but a bundle with that name already exists.') !== -1);
      })
    });
  });
});
