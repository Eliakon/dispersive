const ulid = require('ulid');
const {createEntryMixin} = require('../model');
const {withField} = require('.');

const createManyRelation = ({QuerySetConstructor, relation, pk}) => {
  const ManyRelation = class extends QuerySetConstructor {

    constructor({parent}) {
      super({QuerySetConstructor, parent});
      this.relation = relation;
      this.pk = pk;
    }

    add(entry) {
      return entry.update({[this.relation.pkName]: this.pk});
    }

  };

  return new ManyRelation({parent: relation.model.objects.filter({[relation.pkName]: pk})});
};

const withRelationField = ({model, relation, name}) => (
  createEntryMixin(({Base}) => class extends Base {

    set [relation.fieldName](entry) {
      entry[name].add(this);
    }

    get [relation.fieldName]() {
      return model.objects.get({pk: this[relation.pkName]});
    }

  })
);

const withMany = (name, {model = null, relatedName = null}) => {
  const relation = {
    model,
    fieldName: relatedName,
    pkName: relatedName ? `_${relatedName}_pk` : `_many_${name}_pk_${ulid()}`,
  };

  relation.model.inject(withField(relation.pkName));

  return createEntryMixin(({Base, setup}) => {
    const QuerySetConstructor = setup.get('QuerySetConstructor');

    if (relation.fieldName) {
      relation.model.inject(withRelationField({model: setup.get('model'), name, relation}));
    }

    return class extends Base {
      get [name]() {
        return createManyRelation({QuerySetConstructor, relation, pk: this.pk});
      }
    };
  });
};

module.exports = {
  withMany,
};
