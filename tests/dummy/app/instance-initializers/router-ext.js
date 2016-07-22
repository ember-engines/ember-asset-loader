import Ember from 'ember';

let assetLoader;

Ember.Router.reopen({
  _getHandlerFunction() {
    const originalFunction = this._super(...arguments);

    return function _getHandler() {
      return assetLoader.loadBundle('test').then(() => {
        return originalFunction(...arguments);
      });
    };
  }
});

function initialize(instance) {
  assetLoader = instance.lookup('service:asset-loader');
  assetLoader.pushManifest({
    bundles: {
      test: {
        assets: [
          { type: 'js', uri: '/test.js' },
          { type: 'css', uri: '/test.css' }
        ]
      }
    }
  });
}

export default {
  name: 'router-ext',
  initialize
};
