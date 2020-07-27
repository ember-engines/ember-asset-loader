import Ember from 'ember';

let hasRan = false;

function initialize() {
  if (hasRan) { return; }

  hasRan = true;

  Ember.Router.reopen({
    assetLoader: Ember.inject.service(),

    setupRouter() {
      let isSetup = this._super(...arguments);
      // Different versions of routerMicrolib use the names `getRoute` vs
      // `getHandler`.
      if (this._routerMicrolib.getRoute !== undefined) {
        this._routerMicrolib.getRoute = this._handlerResolver(
          this._routerMicrolib.getRoute.bind(this._routerMicrolib)
        );
      } else if (this._routerMicrolib.getHandler !== undefined) {
        this._routerMicrolib.getHandler = this._handlerResolver(
          this._routerMicrolib.getHandler.bind(this._routerMicrolib)
        );
      }
      return isSetup;
    },

    _handlerResolver(original) {
      return (name) => {
        return this.get('assetLoader').loadBundle('test').then(() => {
          return original(name);
        });
      };
    }
  });
}

export default {
  name: 'router-ext',
  initialize
};
