var path = require('path');
var assert = require('assert');
var walk = require('walk-sync');
var fs = require('fs-extra');
var broccoli = require('broccoli');

var AssetManifestInserter = require('../lib/asset-manifest-inserter');
var metaHandler = require('../lib/meta-handler');

var fixturePath = path.join(__dirname, 'fixtures');
var inputTrees = [ path.join(fixturePath, 'insertion-test') ];

function build(assertion, options) {
  return function() {
    options = options || {};

    var inserter = new AssetManifestInserter(inputTrees, options);
    var builder = new broccoli.Builder(inserter);

    return builder.build()
      .then(assertion)
      .then(function() {
        builder.cleanup();
      });
  }
}

describe('asset-manifest-inserter', function() {
  describe('build', function() {

    it('only modifies index.html', build(function(results) {
        var output = results.directory;
        assert.deepEqual(walk(output), [ 'index.html', 'tests/', 'tests/index.html' ]);
      })
    );

    it('uses the correct file', build(function(results) {
        var output = results.directory;
        assert.deepEqual(walk(output), [ 'extra.html', 'tests/', 'tests/index.html' ]);
      }, { indexName: 'extra.html' })
    );

    it('successfully modifies the manifest', build(function(results) {
        var output = results.directory;
        var indexFilePath = path.join(output, 'index.html');
        var testIndexFilePath = path.join(output, 'tests', 'index.html');
        var manifestFilePath = path.join(inputTrees[0], 'asset-manifest.json')

        var index = fs.readFileSync(indexFilePath, { encoding: 'utf8' });
        var testIndex = fs.readFileSync(testIndexFilePath, { encoding: 'utf8' });
        var assetManifest = fs.readJsonSync(manifestFilePath);

        var needle = metaHandler.escaper(assetManifest);

        assert.notEqual(index.indexOf(needle), -1);
        assert.notEqual(testIndex.indexOf(needle), -1);
      })
    );

  });
});
