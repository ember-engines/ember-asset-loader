import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit, currentRouteName } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import { Promise } from 'rsvp';

function waitFor(checkerFn, timeout = 1000) {
  let start = Date.now();

  return new Promise((resolve, reject) => {
    let watcher = setInterval(() => {
      if (Date.now() - start > timeout) {
        reject(new Error('Timeout expired while waiting for condition.'));
      }

      if (!checkerFn()) {
        return;
      }

      clearInterval(watcher);

      run(null, resolve);
    });
  });
}

module('Acceptance | asset-load', function (hooks) {
  setupApplicationTest(hooks);

  test('visiting a route which loads a bundle', async function (assert) {
    assert.expect(7);

    const container = document.getElementById('ember-testing');
    const originalContainerStyle = window.getComputedStyle(container);
    const originalBackgroundColor = originalContainerStyle.backgroundColor;
    const originalColor = originalContainerStyle.color;

    let containerText = container.innerText;
    assert.strictEqual(
      containerText,
      '',
      'test container is empty before load'
    );

    await visit('/');

    assert.strictEqual(currentRouteName(), 'index', 'transitioned ');

    const testScriptText = container.querySelector('h2').innerText;
    assert.strictEqual(
      testScriptText,
      'Test script loaded!',
      'test script was executed'
    );

    const routeText = container.querySelector('h1').innerText;
    assert.strictEqual(routeText, 'Welcome!', 'route was loaded correctly');

    containerText = container.innerText;
    assert.ok(
      containerText.indexOf(testScriptText) < containerText.indexOf(routeText),
      'test script was executed before route load'
    );

    return waitFor(() => {
      const containerStyle = window.getComputedStyle(container);

      return containerStyle.backgroundColor !== originalBackgroundColor;
    })
      .catch((reason) => {
        assert.notOk(true, reason.message);
      })
      .then(() => {
        const containerStyle = window.getComputedStyle(container);
        assert.notEqual(
          containerStyle.backgroundColor,
          originalBackgroundColor,
          'background color is different after css load'
        );
        assert.notEqual(
          containerStyle.color,
          originalColor,
          'color is different after css load'
        );
      });
  });

  test('visiting a route which fails to load a script removes the node from DOM', async function (assert) {
    assert.expect(2);

    const getScript = () => document.querySelector('script[src="foo.js"]');

    await visit('asset-error');

    assert.strictEqual(currentRouteName(), 'asset-error', 'transitioned ');

    return waitFor(() => !getScript())
      .catch((reason) => {
        assert.notOk(true, reason.message);
      })
      .then(() => {
        assert.ok(true, 'failed assets were removed from DOM');
      });
  });
});
