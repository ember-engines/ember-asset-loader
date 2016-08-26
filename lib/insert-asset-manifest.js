var mergeTrees = require('broccoli-merge-trees');
var AssetManifestInserter = require('./asset-manifest-inserter');

/**
 * Given a tree, this function will insert the asset manifest into index.html.
 *
 * The `options` object is passed directly into the broccoli plugin.
 *
 * @public
 * @param {Tree} tree
 * @param {object} options
 * @return {Tree}
 */
module.exports = function insertAssetManifest(tree, options) {
  var indicesWithManifests = new AssetManifestInserter([tree], options);
  return mergeTrees([tree, indicesWithManifests], { overwrite: true });
};
