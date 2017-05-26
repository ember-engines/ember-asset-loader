import RSVP from 'rsvp';
import { moduleFor, test } from 'ember-qunit';

function noop() {}
function shouldNotHappen(assert) {
  return () => assert.ok(false, 'callback should not happen');
}

moduleFor('service:asset-loader', 'Unit | Service | asset-loader');

test('loadBundle() - throws an error if no asset manifest has been provided', function(assert) {
  const service = this.subject();

  assert.throws(() => service.loadBundle('blog'), /No asset manifest found. Ensure you call pushManifest before attempting to use the AssetLoader./);
});

test('loadBundle() - throws an error if asset manifest does not list any bundles', function(assert) {
  const service = this.subject();

  service.pushManifest({});

  assert.throws(() => service.loadBundle('blog'), /Asset manifest does not list any available bundles./);
});

test('loadBundle() - throws an error if asset manifest does not contain the bundle', function(assert) {
  const service = this.subject();

  service.pushManifest({
    bundles: {
      chat: {}
    }
  });

  assert.throws(() => service.loadBundle('blog'), /No bundle with name "blog" exists in the asset manifest./);
});

test('loadBundle() - returns a promise that resolves with the name of the loaded bundle', function(assert) {
  assert.expect(1);

  const service = this.subject();

  service.pushManifest({
    bundles: {
      blog: {}
    }
  });

  return service.loadBundle('blog').then((bundle) => {
    assert.equal(bundle, 'blog');
  });
});

test('loadBundle() - subsequent calls return the same promise', function(assert) {
  assert.expect(1);

  const service = this.subject();

  service.pushManifest({
    bundles: {
      blog: {}
    }
  });

  const firstCall = service.loadBundle('blog');
  const secondCall = service.loadBundle('blog');

  assert.strictEqual(firstCall, secondCall);
});

test('loadBundle() - rejects with a BundleLoadError', function(assert) {
  assert.expect(2);

  const service = this.subject();

  service.pushManifest({
    bundles: {
      blog: {
        assets: [
          { type: 'fail', uri: 'someuri' }
        ]
      }
    }
  });

  service.defineLoader('fail', () => RSVP.reject('rejected'));

  return service.loadBundle('blog').then(
    shouldNotHappen(assert),
    (error) => {
      assert.equal(error.errors.length, 1, 'has an array of the errors causing the load to fail.');
      assert.equal(error.toString(), 'BundleLoadError: The bundle "blog" failed to load.', 'error message contains correct info.');
    }
  );
});

test('loadBundle() - a rejection allows retrying the load', function(assert) {
  assert.expect(2);

  const service = this.subject();

  service.pushManifest({
    bundles: {
      blog: {
        assets: [
          { type: 'fail', uri: 'someuri' }
        ]
      }
    }
  });

  service.defineLoader('fail', () => RSVP.reject('rejected'));

  return service.loadBundle('blog').then(
    shouldNotHappen(assert),
    (error) => {
      assert.ok(true, 'first error occured');
      return error.retryLoad();
    }
  ).then(
    shouldNotHappen(assert),
    () => {
      assert.ok(true, 'retry error occured');
    }
  );
});

test('loadBundle() - retrying a load twice returns the same promise', function(assert) {
  assert.expect(2);

  const service = this.subject();

  service.pushManifest({
    bundles: {
      blog: {
        assets: [
          { type: 'fail', uri: 'someuri' }
        ]
      }
    }
  });

  service.defineLoader('fail', () => RSVP.reject('rejected'));

  return service.loadBundle('blog').then(
    shouldNotHappen(assert),
    (error) => {
      const firstRetry = error.retryLoad();
      const secondRetry = error.retryLoad();
      const serviceRetry = service.loadBundle('blog');

      assert.strictEqual(firstRetry, secondRetry, 'multiple retries produce same results');
      assert.strictEqual(firstRetry, serviceRetry, 'calling loadBundle again returns the retry result');

      return firstRetry;
    }
  ).catch(noop);
});

test('loadAsset() - throws an error if there is no loader defined for the asset type', function(assert) {
  const service = this.subject();
  const asset = { type: 'crazy-type', uri: 'someuri' };

  assert.throws(() => service.loadAsset(asset), /No loader for assets of type "crazy-type" defined./);
});

test('loadAsset() - returns a promise that resolves with the loaded asset information', function(assert) {
  assert.expect(1);

  const service = this.subject();
  const asset = { type: 'test', uri: 'someuri' };

  service.defineLoader('test', (uri) => RSVP.resolve(uri));

  return service.loadAsset(asset).then((result) => {
    assert.deepEqual(result, asset);
  });
});

test('loadAsset() - subsequent calls return the same promise', function(assert) {
  assert.expect(1);

  const service = this.subject();
  const asset = { type: 'test', uri: 'someuri' };

  service.defineLoader('test', (uri) => RSVP.resolve(uri));

  const firstCall = service.loadAsset(asset);
  const secondCall = service.loadAsset(asset);

  assert.strictEqual(firstCall, secondCall);
});

test('loadAsset() - rejects with an AssetLoadPromise', function(assert) {
  assert.expect(1);

  const service = this.subject();
  const asset = { type: 'test', uri: 'someuri' };

  service.defineLoader('test', () => RSVP.reject('some error'));

  return service.loadAsset(asset).then(shouldNotHappen(assert), (error) => {
    assert.equal(error.toString(), 'AssetLoadError: The test asset with uri "someuri" failed to load with the error: some error.');
  });
});

test('loadAsset() - a rejection allows retrying the load', function(assert) {
  assert.expect(2);

  const service = this.subject();
  const asset = { type: 'test', uri: 'someuri' };

  service.defineLoader('test', () => RSVP.reject('some error'));

  return service.loadAsset(asset).then(
    shouldNotHappen(assert),
    (error) => {
      assert.ok(true, 'first error occured');
      return error.retryLoad();
    }
  ).then(
    shouldNotHappen(assert),
    () => {
      assert.ok(true, 'retry error occured');
    }
  );
});

test('loadAsset() - retrying a load twice returns the same promise', function(assert) {
  assert.expect(2);

  const service = this.subject();
  const asset = { type: 'test', uri: 'someuri' };

  service.defineLoader('test', () => RSVP.reject('some error'));

  return service.loadAsset(asset).then(
    shouldNotHappen(assert),
    (error) => {
      const firstRetry = error.retryLoad();
      const secondRetry = error.retryLoad();
      const serviceRetry = service.loadAsset(asset);

      assert.strictEqual(firstRetry, secondRetry, 'multiple retries produce same results');
      assert.strictEqual(firstRetry, serviceRetry, 'calling loadBundle again returns the retry result');

      return firstRetry;
    }
  ).catch(noop);
});

test('loadAsset() - js - handles successful load', function(assert) {
  assert.expect(0);

  const service = this.subject();
  const asset = { type: 'js', uri: '/unit-test.js' };

  return service.loadAsset(asset);
});

test('loadAsset() - js - handles failed load', function(assert) {
  assert.expect(1);

  const service = this.subject();
  const asset = { type: 'js', uri: '/unit-test.jsss' };

  return service.loadAsset(asset);
});

test('loadAsset() - js - does not insert additional script tag if asset is in DOM already', function(assert) {
  assert.expect(1);

  if (!document.querySelector('script[src="/unit-test.js"]')) {
    const script = document.createElement('script');
    script.src = '/unit-test.js';
    document.body.appendChild(script);
  }

  const service = this.subject();
  const asset = { type: 'js', uri: '/unit-test.js' };
  const numScripts = document.querySelectorAll('script').length;

  return service.loadAsset(asset).then(() => {
    const newNumScripts = document.querySelectorAll('script').length;
    assert.equal(newNumScripts, numScripts);
  });
});

test('loadAsset() - js - sets async false to try to guarantee execution order', function(assert) {
  assert.expect(1);

  const service = this.subject();
  const asset = { type: 'js', uri: '/unit-test.js' };

  return service.loadAsset(asset).then(() => {
    const script = document.querySelector('script[src="/unit-test.js"]');
    assert.equal(script.async, false);
  });
});

test('loadAsset() - css - handles successful load', function(assert) {
  assert.expect(0);

  const service = this.subject();
  const asset = { type: 'css', uri: '/unit-test.css' };

  return service.loadAsset(asset);
});

test('loadAsset() - css - handles failed load', function(assert) {
  assert.expect(0);

  const service = this.subject();
  const asset = { type: 'css', uri: '/unit-test.csss' };

  // Since onload/onerror support is spotty for link elements, we allow
  // non-Chrome browsers to either resolve or reject (they should do something).
  var isChrome = !!window.chrome && window.navigator.vendor === 'Google Inc.';
  if (isChrome) {
    return service.loadAsset(asset);
  } else {
    return service.loadAsset(asset);
  }
});

test('loadAsset() - css - does not insert additional link tag if asset is in DOM already', function(assert) {
  assert.expect(1);

  if (!document.querySelector('link[href="/unit-test.css"]')) {
    const link = document.createElement('link');
    link.href = '/unit-test.css';
    document.head.appendChild(link);
  }

  const service = this.subject();
  const asset = { type: 'css', uri: '/unit-test.css' };
  const numLinks = document.querySelectorAll('link').length;

  return service.loadAsset(asset).then(() => {
    const newNumLinks = document.querySelectorAll('link').length;
    assert.equal(newNumLinks, numLinks);
  });
});

test('defineLoader() - overwrites existing asset loader types', function(assert) {
  assert.expect(1);

  const service = this.subject();
  const asset = { type: 'test', uri: 'someuri' };

  service.defineLoader('test', () => RSVP.reject());
  service.defineLoader('test', () => RSVP.resolve());

  return service.loadAsset(asset).then(
    () => assert.ok(true),
    shouldNotHappen(assert)
  );
});

test('pushManifest() - throws an error when merging two manifests with the same bundle', function(assert) {
  const service = this.subject();
  const manifest = {
    bundles: {
      blog: {}
    }
  };

  service.pushManifest(manifest);
  assert.throws(() => service.pushManifest(manifest), /The bundle "blog" already exists./);
});
