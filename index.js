/* eslint-env node */
'use strict';

const funnel = require('broccoli-funnel');
const findHost = require('./lib/utils/find-host');

module.exports = {
  name: 'ember-asset-loader',

  /**
   * If the app has specified `noManifest` to be generated, then we don't
   * include the shim for the manifest and the service initializer.
   *
   * @override
   */
  treeForApp: function () {
    let tree = this._super.treeForApp.apply(this, arguments);
    const app = findHost(this);

    if (
      app &&
      app.options &&
      app.options.assetLoader &&
      app.options.assetLoader.noManifest
    ) {
      tree = funnel(tree, {
        exclude: [
          'config/asset-manifest.js',
          'instance-initializers/load-asset-manifest.js',
        ],
      });
    }

    return tree;
  },
};
