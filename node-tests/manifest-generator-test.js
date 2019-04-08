'use strict';

var path = require('path');
var assert = require('assert');
var walk = require('walk-sync');
var fs = require('fs-extra');

var ManifestGenerator = require('../lib/manifest-generator');
var metaHandler = require('../lib/meta-handler');

const co = require('co');
const helpers = require('broccoli-test-helper');
const createBuilder = helpers.createBuilder;
const createTempDir = helpers.createTempDir;

describe('manifest-generator', function() {
  function createGenerator(options, outputPaths) {
    outputPaths = outputPaths || {
      app: {
        html: 'index.html'
      }
    };

    var Addon = ManifestGenerator.extend({
      name: 'test',
      root: process.cwd(),
      app: {
        options: {
          assetLoader: options,
          outputPaths: outputPaths
        }
      }
    });

    return new Addon();
  }

  let input;
  let output;

  beforeEach(co.wrap(function* () {
    input = yield createTempDir();
  }));

  afterEach(co.wrap(function* () {
    yield input.dispose();

    if (output) {
      yield output.dispose();
    }
  }));

  describe('contentFor', function() {
    it('returns a meta tag with a placeholder for head-footer', function() {
      var generator = createGenerator();
      var result = generator.contentFor('head-footer', { modulePrefix: 'dummy' });
      assert.equal(result, '<meta name="dummy/config/asset-manifest" content="%GENERATED_ASSET_MANIFEST%" />');
    });

    it('returns nothing when using the noManifest option', function() {
      var generator = createGenerator({
        noManifest: true
      });
      var result = generator.contentFor('head-footer', { modulePrefix: 'dummy' });
      assert.equal(result, undefined);
    });

    it('returns nothing when type is not head-footer', function() {
      var generator = createGenerator();
      var result = generator.contentFor('head', { modulePrefix: 'dummy' });
      assert.equal(result, undefined);
    });
  });

  describe('postprocessTree', function() {
    var fixturePath = path.join(__dirname, 'fixtures');
    var inputTree = path.join(fixturePath, 'insertion-test');

    it('returns the input tree if not of type all', function() {
      var generator = createGenerator();
      var processedTree = generator.postprocessTree('js', inputTree);

      assert.strictEqual(processedTree, inputTree);
    });

    it('returns the input tree when using the noManifest option', function() {
      var generator = createGenerator({
        noManifest: true
      });
      var processedTree = generator.postprocessTree('all', inputTree);

      assert.strictEqual(processedTree, inputTree);
    });

    let verifyInsertedManifest = co.wrap(function* verifyInsertedManifest(expectedManifestPath, indexPath, generateURI) {
      var fixturePath = path.join(__dirname, 'fixtures');
      var inputTree = path.join(fixturePath, 'generator-test');

      var generator = createGenerator({
        generateURI: generateURI
      }, {
        app: {
          html: indexPath
        }
      });
      var processedTree = generator.postprocessTree('all', inputTree);
      output = createBuilder(processedTree);

      yield output.build();

      var outputFiles = walk(output.path());
      var inputFiles = walk(inputTree);

      assert.notEqual(outputFiles.indexOf('asset-manifest.json'), -1, 'the output tree contains an asset manifest');
      assert.equal(inputFiles.indexOf('asset-manifest.json'), -1, 'the input tree does not contain an asset manifest');

      var manifest = fs.readJsonSync(output.path('asset-manifest.json'));
      var expectedManifest = fs.readJsonSync(path.join(inputTree, 'expected-manifests', expectedManifestPath));

      assert.deepEqual(manifest, expectedManifest, 'generated manifest equals the expected manifest');

      var escapedManifest = metaHandler.transformer(manifest);
      var indexFile = fs.readFileSync(output.path(indexPath));

      assert.notEqual(indexFile.indexOf(escapedManifest), -1, 'index contains the escaped manifest');
    });

    it('generates an asset manifest, merges it into the given tree, and inserts it into index.html', function() {
      return verifyInsertedManifest('basic-manifest.json', 'index.html');
    });

    it('inserts the asset manifest into a custom index path', function() {
      return verifyInsertedManifest('basic-manifest.json', 'extra.html');
    });

    it('uses the generateURI method to create the URIs', function() {
      return verifyInsertedManifest('cdn-manifest.json', 'index.html', function(filePath) {
        return 'http://cdn.io' + filePath;
      });
    });

    it('uses filesToIgnore', co.wrap(function* () {
      const generator = createGenerator({
        filesToIgnore: [/chat/]
      });

      var inputTree = path.join(__dirname, 'fixtures', 'generator-test');
      var processedTree = generator.postprocessTree('all', inputTree);
      output = createBuilder(processedTree);

      yield output.build();
      var manifest = fs.readJsonSync(output.path('asset-manifest.json'));

      assert.deepEqual(manifest.bundles.chat.assets, []);
    }));
  });
})
