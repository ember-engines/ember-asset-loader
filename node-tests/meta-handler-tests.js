var assert = require('assert');
var metaHandler = require('../lib/meta-handler');

function testStringGenerator(sourceJSON) {
  return '<meta name="testing/config/asset-manifest" content="'+ metaHandler.transformer(sourceJSON) +'" />';
}

describe('meta-handler', function() {
  describe('replacer', function() {
    it('does not throw on empty input', function() {
      var result = metaHandler.replacer('', '');
      assert.equal(result, '');
    });

    it('supports ">" in bundle', function() {
      var replacement = 'result';

      var before = testStringGenerator({ foo: '>' });
      var after = testStringGenerator(replacement);

      var result = metaHandler.replacer(before, metaHandler.transformer(replacement));
      assert.equal(result, after);
    });

    it('only replaces the first occurrence', function() {
      var replacement = 'result';

      var before = [
        testStringGenerator({ one: 1 }),
        testStringGenerator({ two: 2 })
      ];

      var after = [
        testStringGenerator(replacement),
        before[1]
      ];

      var result = metaHandler.replacer(before.join(''), metaHandler.transformer(replacement));
      assert.equal(result, after.join(''));
    });

    it('supports newlines', function() {
      var replacement = 'result';

      var before = [
        "First line.",
        testStringGenerator({ one: 1 }),
        testStringGenerator({ two: 2 })
      ];

      var after = [
        before[0],
        testStringGenerator(replacement),
        before[2]
      ];

      var result = metaHandler.replacer(before.join('\r\n'), metaHandler.transformer(replacement));
      assert.equal(result, after.join('\r\n'));
    });
  });
});
