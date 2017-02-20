const FBEmitter = require('fbemitter').EventEmitter;


class Emittable {

  emitChange(data = {}) {
    this.emit('change', data);
  }

  changed(listener, ctx = null) {
    return this.on('change', listener, ctx);
  }

  on(name, listener, ctx = null) {
    return this.emitter.addListener(name, (data) => listener.call(ctx, data));
  }

  emit(name, data = {}) {
    this.emitter.emit(name, data);
  }

}


class EventEmitter extends Emittable {

  constructor() {
    super();
    this.emitter = new FBEmitter();
  }

  static createEmitter() {
    return new FBEmitter();
  }

}

EventEmitter.Emittable = Emittable;

module.exports = EventEmitter;
