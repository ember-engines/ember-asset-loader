import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

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

    const containerStyle = window.getComputedStyle(container);
    assert.notEqual(containerStyle.backgroundColor, originalBackgroundColor, 'background color is different after css load');
    assert.notEqual(containerStyle.color, originalColor, 'color is different after css load');
  });
});
