const QuerySet = require('./queryset');
const EventEmitter = require('./emitter');
const hat = require('hat');

class Index {

  constructor(name) {
    this.name = name;
    this.refs = {};
  }

  hasRef(ref) {
    return ref in this.refs;
  }

  add(values) {
    if ((this.name in values) && ('id' in values)) {
      this.link(values[this.name], values);
      this.refs[values.id] = values[this.name];
    }
  }

  delete(values) {
    if (! (values.id in this.refs)) return;

    const val = this.refs[values.id];

    this.unlink(val, values);
    delete this.refs[values.id];
  }

}

class SetIndex extends Index {

  constructor(name) {
    super(name);
    this.sets = {};
  }

  link(val, values) {
    if (! (val in this.sets)) this.sets[val] = new Set();

    this.sets[val].add(values);
  }

  unlink(val, values) {
    this.sets[val].delete(values);
  }

  countOf(val) {
    return (val in this.sets) ? Array.from(this.sets[val]).length : 0;
  }

  *allOf(val) {
    if (val in this.sets) {
      for (const values of this.sets[val]) {
        yield values;
      }
    }
  }

}

class UniqueIndex extends Index {

  constructor(name) {
    super(name);
    this.kvs = {};
  }

  link(val, values) {
    if (val in this.kvs) throw new UniqueIndex.AlreadyExists(this.name, val);

    this.kvs[val] = values;
  }

  unlink(val) {
    delete this.kvs[val];
  }

  get(val) {
    return this.kvs[val];
  }

  countOf(val) {
    return (val in this.kvs) ? 1 : 0;
  }

  *allOf(val) {
    if (val in this.kvs) yield this.kvs[val];
  }

  *all() {
    for (const val of Object.keys(this.kvs)) {
      yield this.kvs[val];
    }
  }

}

UniqueIndex.AlreadyExists = class {

  constructor(name, val) {
    this.name = 'AlreadyExists';
    this.message = `Model with '${name}' = ${val} already exists`;
  }

};


class ObjectManager extends QuerySet {

  constructor(model) {
    super({model});

    if (!model || !model.schema) throw new ObjectManager.NoSchema();

    this.manager = this;
    this.generator = this.models;
    this.index = this.buildIndex();
    this.indexNames = Object.keys(this.index).filter(name => name !== 'id');
    this.emitters = {};
  }

  buildIndex() {
    const index = {};

    for (const [name, field] of this.model.schema.fields()) {
      if (!!field.index) {
        const IndexType = field.unique ? UniqueIndex : SetIndex;

        index[name] = new IndexType(name);
      }
    }

    return index;
  }

  *models(prefilters = []) {
    let base = this.index.id.all();
    let lowerCount = Infinity;

    for (const prefilter of prefilters) {
      const count = this.index[prefilter.name].countOf(prefilter.val);

      if (count < lowerCount) {
        base = this.index[prefilter.name].allOf(prefilter.val);
        lowerCount = count;
      }
    }

    for (const values of base) {
      yield this._modelFromValues(values);
    }
  }

  _modelFromValues(values) {
    const ModelType = this.model;
    const model = new ModelType(values);

    model.emitter = this.emitters[model.id];
    return model;
  }

  getOrCreate(basis, opts = {emitChange: true}) {
    let model = null;

    try {
      model = this.get(basis);
    } catch (err) {
      model = this.create(basis, opts);
    }

    return model;
  }

  create(data, opts = {emitChange: true}) {
    const ModelType = this.model;
    const model = new ModelType(data);

    model.save(opts);
    return model;
  }

  _syncLinks(values) {
    for (const indexName of this.indexNames) {
      this.index[indexName].add(values);
    }
  }

  _unsyncLinks(values) {
    for (const indexName of this.indexNames) {
      this.index[indexName].delete(values);
    }
  }

  _syncNew(model, opts = {emitChange: true}) {
    let values = null;

    model.id = hat();
    model.emitter = EventEmitter.createEmitter();
    values = model.schemaValues();

    this.emitters[model.id] = model.emitter;
    this.index.id.add(values);
    this._syncLinks(this.index.id.get(model.id));

    if (opts.emitChange) this.emitChange({source: values});
  }

  _syncExisting(model) {
    let schemaValues = null;

    if (! this.index.id.get(model.id)) throw new ObjectManager.ModelNotSyncable();

    schemaValues = model.schemaValues();

    Object.assign(this.index.id.get(model.id), schemaValues);
    this._syncLinks(schemaValues);
  }

  isValidId(id) {
    return this.index.id.hasRef(id);
  }

  sync(model, opts = {emitChange: true}) {
    if (!!model.id) return this._syncExisting(model);

    this._syncNew(model, opts);
  }

  unsync(model, opts = {emitChange: true}) {
    let values = null;

    if (!this.index.id.hasRef(model.id)) return;

    values = this.index.id.get(model.id);

    this._unsyncLinks(values);
    this.index.id.delete(values);
    delete this.emitters[model.id];

    if (opts.emitChange) this.emitChange({source: values});
  }

}

ObjectManager.ModelNotSyncable = class extend {

  constructor() {
    this.name = 'ModelNotSyncable';
    this.message = 'Could not sync model that was previously deleted';
  }

};

ObjectManager.NoSchema = class {

  constructor() {
    this.name = 'NoSchema';
    this.message = 'Cannot create a model without a schema';
  }

};

module.exports = ObjectManager;
