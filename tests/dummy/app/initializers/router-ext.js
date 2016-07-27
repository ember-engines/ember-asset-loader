import Ember from 'ember';

let hasRan = false;

function initialize() {
  if (hasRan) { return; }

  hasRan = true;

  Ember.Router.reopen({
    assetLoader: Ember.inject.service(),

    _getHandlerFunction() {
      const originalFunction = this._super(...arguments);

      return (name) => {
        return this.get('assetLoader').loadBundle('test').then(() => {
          return originalFunction(name);
        });
      };
    }
  });
}

export default {
  name: 'router-ext',
  initialize
};
