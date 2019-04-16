import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

const { run } = Ember;
const { Promise } = Ember.RSVP;

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

moduleForAcceptance('Acceptance | asset-load');

test('visiting a route which loads a bundle', function(assert) {
  assert.expect(7);

  const container = document.getElementById('ember-testing');
  const originalContainerStyle = window.getComputedStyle(container);
  const originalBackgroundColor = originalContainerStyle.backgroundColor;
  const originalColor = originalContainerStyle.color;

  const containerText = container.innerText;
  assert.equal(containerText, '', 'test container is empty before load');

  visit('/');

  andThen(function() {
    assert.equal(currentRouteName(), 'index', 'transitioned ');

    const testScriptText = container.querySelector('h2').innerText;
    assert.equal(testScriptText, 'Test script loaded!', 'test script was executed');

    const routeText = container.querySelector('h1').innerText;
    assert.equal(routeText, 'Welcome!', 'route was loaded correctly');

    const containerText = container.innerText;
    assert.ok(containerText.indexOf(testScriptText) < containerText.indexOf(routeText), 'test script was executed before route load');

    return waitFor(() => {
      const containerStyle = window.getComputedStyle(container);

      return containerStyle.backgroundColor !== originalBackgroundColor;
    })
      .catch((reason) => {
        assert.notOk(true, reason.message);
      })
      .then(() => {
        const containerStyle = window.getComputedStyle(container);
        assert.notEqual(containerStyle.backgroundColor, originalBackgroundColor, 'background color is different after css load');
        assert.notEqual(containerStyle.color, originalColor, 'color is different after css load');
      });
  });
});

test('visiting a route which fails to load a script removes the node from DOM', function(assert) {
  assert.expect(2);

  const getScript = () => document.querySelector('script[src="foo.js"]');

  visit('asset-error');

  andThen(function() {
    assert.equal(currentRouteName(), 'asset-error', 'transitioned ');

    return waitFor(() => !getScript())
      .catch((reason) => {
        assert.notOk(true, reason.message);
      })
      .then(() => {
        assert.ok(true, 'failed assets were removed from DOM');
      });
  });
});
