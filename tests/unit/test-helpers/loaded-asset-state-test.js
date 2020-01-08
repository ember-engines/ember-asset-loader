import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { cacheLoadedAssetState, getLoadedAssetState, resetLoadedAssetState } from 'ember-asset-loader/test-support/loaded-asset-state';

module('Unit | Test Helper | loaded-asset-state', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.service = this.owner.lookup('service:asset-loader');
  });

  test('resetLoadedAssetState removes new script tags, new link tags, and new modules', function(assert) {
    assert.expect(4);

    const startingState = getLoadedAssetState();

    cacheLoadedAssetState();

    return this.service.loadBundle('loaded-asset-state').then(() => {
      const middleState = getLoadedAssetState();
      assert.notDeepEqual(startingState.requireEntries, middleState.requireEntries, 'starting and middle state for require entries are not the same');
      assert.notDeepEqual(startingState.scripts, middleState.scripts, 'starting and middle state for scripts are not the same');
      assert.notDeepEqual(startingState.links, middleState.links, 'starting and middle state for links are not the same');

      resetLoadedAssetState();

      assert.deepEqual(startingState, getLoadedAssetState(), 'starting and ending state are the same');
    });
  });
});
