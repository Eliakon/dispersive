const assert = require('assert');
const sinon = require('sinon');
const Dispersive = require('..');
const Dispatcher = require('../lib/dispatcher');


describe('Action', () => {

  const Store = Dispersive.createStore();

  it('should trigger immediately after', () => {
    const listener = sinon.spy();
    const action = Dispersive.createAction(
      (value) => ({value})
    );

    Store.bindAction(action, listener);
    action(42);
    assert(listener.called);
    assert.equal(42, listener.getCall(0).args[0].value);
  });
 
  it('should trigger asynchronously', (done) => {
    const listener = (data) => {
      assert.equal(42, data.value);
      done();
    };

    const action = Dispersive.createAction(
      (value) => new Promise((resolve, reject) => resolve({value}))
    );

    Store.bindAction(action, listener);
    action(42);
  });

  it('should chain actions', (done) => {
    const listener1 = sinon.spy();
    const listener2 = sinon.spy();

    const listener = (data) => {
      assert(listener1.called);
      assert(listener2.called);
      done();
    };

    const action1 = Dispersive.createAction(
      (value) => new Promise((resolve, reject) => resolve({value}))
    );

    const action2 = Dispersive.createAction(
      (value) => new Promise((resolve, reject) => resolve({value}))
    );

    const grouped = Dispersive.createAction((value) => (
      Dispersive.createActionGroup()
        .chain(action1, [value])
        .chain(action2, [value])
    ));

    Store.bindAction(action1, listener1);
    Store.bindAction(action2, listener2);
    Store.bindAction(grouped, listener);
    grouped(42);
  });

  it('should trigger action.error when action failed', (done) => {
    const listener = (data) => {
      assert.equal(42, data.value);
      done();
    };    

    const action = Dispersive.createAction(
      (value) => new Promise((resolve, reject) => reject({value}))
    );

    Store.bindAction(action.error, listener);
    action(42);
  });

  it('should trigger action.error when any of the grouped action failed', (done) => {
    const listener1 = sinon.spy();
    const listener2 = sinon.spy();

    const listener = (data) => {
      assert(!listener1.called);
      assert(!listener2.called);
      done();
    };

    const action1 = Dispersive.createAction(
      (value) => new Promise((resolve, reject) => reject({value}))
    );

    const action2 = Dispersive.createAction(
      (value) => new Promise((resolve, reject) => resolve({value}))
    );

    const grouped = Dispersive.createAction((value) => (
      Dispersive.createActionGroup()
        .chain(action1, [value])
        .chain(action2, [value])
    ));

    Store.bindAction(action1, listener1);
    Store.bindAction(action2, listener2);
    Store.bindAction(grouped.error, listener);
    grouped(42);    
  });
})