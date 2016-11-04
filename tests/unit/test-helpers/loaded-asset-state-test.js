import { moduleFor, test } from 'ember-qunit';
import { cacheLoadedAssetState, getLoadedAssetState, resetLoadedAssetState } from 'ember-asset-loader/test-support/loaded-asset-state';

moduleFor('service:asset-loader', 'Unit | Test Helper | loaded-asset-state', {
  beforeEach() {
    this.service = this.subject();
    this.service.pushManifest({
      bundles: {
        'loaded-asset-state': {
          assets: [
            {
              uri: '/test-dist/loaded-asset-state/loaded-asset-state.css',
              type: 'css'
            },
            {
              uri: '/test-dist/loaded-asset-state/loaded-asset-state.js',
              type: 'js'
            }
          ]
        }
      }
    });
  }
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
