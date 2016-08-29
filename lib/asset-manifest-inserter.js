var BroccoliCachingWriter = require('broccoli-caching-writer');
var path = require('path');
var fs = require('fs-extra');
var existsSync = require('exists-sync');
var metaReplacer = require('./meta-handler').replacer;

/**
 * A Broccoli Plugin to modify index.html to include the asset manifest.
 *
 * @class AssetManifestInserter
 * @extends BroccoliCachingWriter
 *
 * @private
 * @param {Tree} tree
 * @param {object} options
 */

AssetManifestInserter.prototype = Object.create(BroccoliCachingWriter.prototype);
AssetManifestInserter.prototype.constructor = AssetManifestInserter;
function AssetManifestInserter(inputNodes, options) {
  options = options || {};
  options.indexName = options.indexName || 'index.html';
  options.cacheInclude = [options.indexName, 'tests/index.html', 'asset-manifest.json'];

  BroccoliCachingWriter.call(this, inputNodes, {
    annotation: options.annotation
  });
  this.options = options;
}

AssetManifestInserter.prototype.build = function() {
  var sourceDir = this.inputPaths[0];
  var manifestFilePath = path.join(sourceDir, 'asset-manifest.json');
  var indexFilePath = path.join(sourceDir, this.options.indexName);
  var testIndexFilePath = path.join(sourceDir, 'tests', 'index.html');

  var manifest;
  try {
    manifest = fs.readJsonSync(manifestFilePath);
  } catch (error) {
    console.warn('\n\nWarning: Unable to read asset-manifest.json from build with error: ' + error)
    console.warn('Warning: Proceeding without generated manifest; you will need to manually provide a manifest to the Asset Loader Service to load bundles at runtime. If this was intentional you can turn this message off via the `noManifest` flag.\n\n');
    manifest = { bundles: {} };
  }

  if (existsSync(indexFilePath)) {
    var indexFile = fs.readFileSync(indexFilePath, { encoding: 'utf8' });
    var index = metaReplacer(indexFile, manifest);
    fs.writeFileSync(path.join(this.outputPath, this.options.indexName), index);
  }

  if (existsSync(testIndexFilePath)) {
    var testIndexFile = fs.readFileSync(testIndexFilePath, { encoding: 'utf8' });
    var testIndex = metaReplacer(testIndexFile, manifest);
    fs.mkdirSync(path.join(this.outputPath, 'tests'));
    fs.writeFileSync(path.join(this.outputPath, 'tests', 'index.html'), testIndex);
  }
};

module.exports = AssetManifestInserter;
