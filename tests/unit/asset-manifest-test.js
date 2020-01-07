/* global requirejs, define */

import { module, test } from 'qunit';
import require from 'require';

module('Unit | asset-manifest', {
  beforeEach() {
    resetModules();
    this.originalNodeModule = requirejs.entries['dummy/config/node-asset-manifest'];
  },

  afterEach() {
    requirejs.entries['dummy/config/node-asset-manifest'] = this.originalNodeModule;
    resetModules();
  }
});

function resetModules() {
  requirejs.unsee('dummy/config/node-asset-manifest');
  requirejs.unsee('dummy/config/asset-manifest');
}

test('node-asset-manifest is generated properly', function(assert) {
  const nodeManifest = require('dummy/config/node-asset-manifest').default;
  delete requirejs.entries['dummy/config/node-asset-manifest'];

  const manifest = require('dummy/config/asset-manifest').default;

  assert.notStrictEqual(nodeManifest, manifest);
  assert.deepEqual(nodeManifest, manifest);
});

test('loads the node-asset-manifest if present', function(assert) {
  const replacementModule = {};
  define('dummy/config/node-asset-manifest', () => ({ default: replacementModule}));

  assert.strictEqual(require('dummy/config/asset-manifest').default, replacementModule);
});

test('loads the manifest from the meta tag if available', function(assert) {
  delete requirejs.entries['dummy/config/node-asset-manifest'];

  const meta = document.querySelector('meta[name="dummy/config/asset-manifest"]');
  const metaContent = meta.getAttribute('content');
  meta.setAttribute('content', '{"derp":"herp"}');
  assert.deepEqual(require('dummy/config/asset-manifest').default, { derp: 'herp' });
  meta.setAttribute('content', metaContent);
});

test('throws an error if unable to load the manifest', function(assert) {
  delete requirejs.entries['dummy/config/node-asset-manifest'];

  const meta = document.querySelector('meta[name="dummy/config/asset-manifest"]');
  const metaContent = meta.getAttribute('content');
  meta.setAttribute('content', 'herp');
  assert.throws(() => assert.deepEqual(require('dummy/config/asset-manifest').default, {}));
  meta.setAttribute('content', metaContent);
});
