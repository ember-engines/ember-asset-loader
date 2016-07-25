/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-asset-loader',

  postprocessTree: function(type, tree) {
    if (type === 'all') {
      tree = require('./lib/generate-asset-manifest')(tree); // eslint-disable-line global-require
    }

    return tree;
  }
};
