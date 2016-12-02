const clone = require('clone');
const ObjectManager = require('./manager');
const EventEmitter = require('./emitter');
const {pick} = require('./object');


class Model extends EventEmitter.Emittable {

  static using({schema = null, manager = ObjectManager}) {
    return class extends Model {
      static get schemaFields() {
        return schema;
      }

      static get manager() {
        return manager;
      }

      static get model() {
        return this;
      }
    };
  }

  static attach(model, {schema = null, manager = ObjectManager}) {
    model.schemaFields = schema;
    model.manager = manager;
    model.model = model;

    return model;
  }

  constructor(data = {}) {
    super();

    if (!this.objects) throw new Model.NoObjectManager();
    if (!this.schema) throw new ObjectManager.NoSchema();

    this.schema.initModel(this);
    this.assign(data, false);
  }

  schemaValues() {
    return clone(pick(this, ...[...this.schema.names()]));
  }

  on(...argv) {
    if (!this.emitter) throw new Model.EmitterNotReady();
    return super.on(...argv);
  }

  emit(...argv) {
    if (!this.emitter) throw new Model.EmitterNotReady();
    return super.emit(...argv);
  }

  save(opts = {emitChange: true}) {
    this.constructor.objects.sync(this, opts);
    return this;
  }

  assign(values = {}, keepId = true) {
    const predicate = typeof values === 'function' ? values : null;
    const id = this.id;

    if (predicate) {
      predicate(this);
    } else {
      Object.assign(this, values);
    }

    if (keepId || !this.objects.isValidId(this.id)) this.id = id;
  }

  update(values, opts) {
    this.assign(values);
    this.save(opts);
  }

  delete() {
    this.objects.unsync(this);
  }

  get schema() {
    return this.constructor.schema;
  }

  get objects() {
    return this.constructor.objects;
  }

}

Model.EmitterNotReady = class {

  constructor() {
    this.name = 'EmitterNotReady';
    this.message = 'Emitter cannot be used before saving the model';
  }

};

Model.NoObjectManager = class {

  constructor() {
    this.name = 'NoObjectManager';
    this.message = 'Model has no Object Manager. Use Model.attach() or Model.use()';
  }

};


module.exports = Model;
