var Plugin = require('broccoli-caching-writer');
var path = require('path');
var fs = require('fs-extra');

/**
 * A Broccoli plugin to generate a module to be used in Node for resolving the
 * asset manifest. Primary use case is for FastBoot like environments.
 *
 * @class NodeAssetManifestGenerator
 * @extends BroccoliCachingWriter
 */
function NodeAssetManifestGenerator(inputTrees, options) {
  options = options || {};

  this.appName = options.appName;

  Plugin.call(this, [ inputTrees ], {
    annotation: options.annotation
  });
}

NodeAssetManifestGenerator.prototype = Object.create(Plugin.prototype);
NodeAssetManifestGenerator.prototype.constructor = NodeAssetManifestGenerator;

/**
 * Generates an asset manifest module on build from the passed in
 * asset-manifest.json file.
 */
NodeAssetManifestGenerator.prototype.build = function() {
  var inputPath = this.inputPaths[0];
  var assetManifestPath = path.join(inputPath, 'asset-manifest.json');
  var assetManifest = fs.readJsonSync(assetManifestPath);

  var moduleTemplatePath = path.join(__dirname, './utils/node-module-template.js');
  var moduleTemplate = fs.readFileSync(moduleTemplatePath, 'utf-8');
  var module = moduleTemplate
    .replace('APP_NAME', this.appName)
    .replace('ASSET_MANIFEST', JSON.stringify(assetManifest));

  var outputAssets = path.join(this.outputPath, 'assets');
  fs.mkdirSync(outputAssets);

  var nodeModuleFile = path.join(outputAssets, 'node-asset-manifest.js');
  fs.writeFileSync(nodeModuleFile, module);
};

module.exports = NodeAssetManifestGenerator;
