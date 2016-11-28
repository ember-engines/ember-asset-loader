import { singlePendingPromise } from 'ember-asset-loader/loaders/utilities';
import { module, test } from 'qunit';
import wait from 'ember-test-helpers/wait';
import Ember from 'ember';

module('Unit | Utility | loaders utilities');

test('singlePendingPromise returns the same promise on subsequent calls until the first one is settled', function(assert) {
  assert.expect(3);

  let resolve;
  const promise = new Ember.RSVP.Promise(r=>resolve =r);
  let returnedPromise = singlePendingPromise('test-key', ()=>promise);
  assert.strictEqual(promise, returnedPromise);

  returnedPromise = singlePendingPromise('test-key', ()=>new Ember.RSVP.Promise(()=>{}));
  assert.strictEqual(promise, returnedPromise);

  resolve(); // Settling the promise should result in a different promise being returned
  return wait().then(() => {
    returnedPromise = singlePendingPromise('test-key', ()=>new Ember.RSVP.Promise(()=>{}));
    assert.notStrictEqual(promise, returnedPromise);
  });
});
