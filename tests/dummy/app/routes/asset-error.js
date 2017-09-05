import Ember from 'ember';

export default Ember.Route.extend({
  assetLoader: Ember.inject.service(),

  beforeModel() {
    this.get('assetLoader').loadAsset({ uri: 'foo.js', type: 'js' }).catch(() => {});

    return this._super(...arguments);
  }
});
