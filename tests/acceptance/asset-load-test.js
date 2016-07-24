import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | asset-load');

test('visiting a route which loads a bundle', function(assert) {
  assert.expect(9);

  const container = document.getElementById('ember-testing');

  const containerStyle = window.getComputedStyle(container);
  assert.equal(containerStyle.backgroundColor, 'rgba(0, 0, 0, 0)', 'background color correctly set before css load');
  assert.equal(containerStyle.color, 'rgb(0, 0, 0)', 'color correctly set before css load');

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

    const containerStyle = window.getComputedStyle(container);
    assert.equal(containerStyle.backgroundColor, 'rgb(51, 51, 51)', 'background color correctly set after css load');
    assert.equal(containerStyle.color, 'rgb(255, 255, 255)', 'color correctly set after css load');
  });
});
