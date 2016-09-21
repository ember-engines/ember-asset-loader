var path = require('path');
var assert = require('assert');
var walk = require('walk-sync');
var broccoli = require('broccoli');
var fs = require('fs-extra');

var ManifestGenerator = require('../lib/manifest-generator');
var metaHandler = require('../lib/meta-handler');

describe('manifest-generator', function() {
  function createGenerator(options, outputPaths) {
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

    function verifyInsertedManifest(indexPath) {
      var fixturePath = path.join(__dirname, 'fixtures');
      var inputTree = path.join(fixturePath, 'generator-test');

      var generator = createGenerator(undefined, {
        app: {
          html: indexPath
        }
      });
      var processedTree = generator.postprocessTree('all', inputTree);

      var builder = new broccoli.Builder(processedTree);
      return builder.build().then(function(results) {
        var output = results.directory;
        var outputFiles = walk(output);
        var inputFiles = walk(inputTree);

        assert.notEqual(outputFiles.indexOf('asset-manifest.json'), -1, 'the output tree contains an asset manifest');
        assert.equal(inputFiles.indexOf('asset-manifest.json'), -1, 'the input tree does not contain an asset manifest');

        var manifest = fs.readJsonSync(path.join(output, 'asset-manifest.json'));
        var escapedManifest = metaHandler.escaper(manifest);
        var indexFile = fs.readFileSync(path.join(output, indexPath));

        assert.notEqual(indexFile.indexOf(escapedManifest), -1, 'index contains the escaped manifest');

        builder.cleanup();
      });
    }

    it('generates an asset manifest, merges it into the given tree, and inserts it into index.html', function() {
      return verifyInsertedManifest('index.html');
    });

    it('inserts the asset manifest into a custom index path', function() {
      return verifyInsertedManifest('extra.html');
    });
  });
})