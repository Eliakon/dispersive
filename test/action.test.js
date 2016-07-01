const assert = require('assert');
const sinon = require('sinon');
const Dispersive = require('..');
const Dispatcher = require('../lib/dispatcher');


describe('Action', () => {

  it('should trigger immediately after', () => {
    const listener = sinon.spy();
    const action = Dispersive.Action.create(
      (value) => ({value})
    );

    Dispatcher.main().on(action, listener);
    action(42);
    assert(listener.called);
    assert.equal(42, listener.getCall(0).args[0].value);
  });
 
  it('should trigger asynchronously', (done) => {
    const listener = (data) => {
      assert.equal(42, data.value);
      done();
    };

    const action = Dispersive.Action.create(
      (value) => new Promise((resolve, reject) => resolve({value}))
    );

    Dispatcher.main().on(action, listener);
    action(42);
  });

  it('should chain actions');

})