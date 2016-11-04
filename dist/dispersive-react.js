(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.DispersiveReact = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }


var _require = Dispersive,
    QuerySet = _require.QuerySet,
    Model = _require.Model;

QuerySet.recompute = true;

var StateField = function () {
  _createClass(StateField, null, [{
    key: 'create',
    value: function create(_ref) {
      var component = _ref.component,
          name = _ref.name,
          spec = _ref.spec;

      if (!!spec.prototype && spec.prototype instanceof StateField) {
        var CustomStateField = spec;

        return new CustomStateField({ component: component, name: name });
      }

      return new QuerySetStateField({ component: component, name: name, queryset: spec });
    }
  }]);

  function StateField(_ref2) {
    var _ref2$component = _ref2.component,
        component = _ref2$component === undefined ? null : _ref2$component,
        _ref2$name = _ref2.name,
        name = _ref2$name === undefined ? null : _ref2$name;

    _classCallCheck(this, StateField);

    this.name = name;
    this.component = component;
  }

  _createClass(StateField, [{
    key: 'initValue',
    value: function initValue(value) {
      this.component.state[this.name] = value;
      this.value = value;
    }
  }, {
    key: 'updateValue',
    value: function updateValue(value) {
      var updater = {};

      updater[this.name] = value;
      this.component.setState(updater);
      this.value = value;
    }
  }, {
    key: 'compute',
    value: function compute() {
      return null;
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      this.initValue(this.compute());
    }
  }, {
    key: 'update',
    value: function update() {
      this.updateValue(this.compute());
    }
  }, {
    key: 'activate',
    value: function activate() {}
  }, {
    key: 'deactivate',
    value: function deactivate() {}
  }]);

  return StateField;
}();

var QuerySetStateField = function (_StateField) {
  _inherits(QuerySetStateField, _StateField);

  function QuerySetStateField(_ref3) {
    var component = _ref3.component,
        name = _ref3.name,
        queryset = _ref3.queryset;

    _classCallCheck(this, QuerySetStateField);

    var _this = _possibleConstructorReturn(this, (QuerySetStateField.__proto__ || Object.getPrototypeOf(QuerySetStateField)).call(this, { component: component, name: name }));

    _this.subscriptions = [];

    if (!_this.queryset) _this.queryset = queryset;

    _this.explode();
    return _this;
  }

  _createClass(QuerySetStateField, [{
    key: 'explode',
    value: function explode() {
      var initial = null;
      var qpack = null;
      var model = null;

      if (typeof this.queryset === 'function') {
        initial = this.queryset(this.component.props, this.component.context);
      } else {
        initial = this.queryset;
      }

      if (initial instanceof QuerySet) initial = initial.values();

      qpack = initial.__qpack__;

      if (initial instanceof Model) {
        model = initial;
        initial = initial.values();
      }

      Object.assign(this, { initial: initial, qpack: qpack, model: model });
    }
  }, {
    key: 'compute',
    value: function compute() {
      return this.qpack.recompute();
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.subscriptions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var subscription = _step.value;

          subscription.remove();
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this.subscriptions = [];
    }
  }, {
    key: 'activate',
    value: function activate() {
      var _this2 = this;

      this.subscriptions.push(this.qpack.queryset.changed(function () {
        return _this2.update();
      }));

      if (!!this.model) this.subscriptions.push(this.model.changed(function () {
        return _this2.update();
      }));
    }
  }]);

  return QuerySetStateField;
}(StateField);

var count = function count(queryset) {
  return function (_QuerySetStateField) {
    _inherits(_class, _QuerySetStateField);

    function _class() {
      _classCallCheck(this, _class);

      return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
    }

    _createClass(_class, [{
      key: 'compute',
      value: function compute() {
        var list = _get(_class.prototype.__proto__ || Object.getPrototypeOf(_class.prototype), 'compute', this).call(this);

        return Array.isArray(list) ? list.length : 0;
      }
    }, {
      key: 'queryset',
      get: function get() {
        return queryset;
      }
    }]);

    return _class;
  }(QuerySetStateField);
};

var Component = function (_React$Component) {
  _inherits(Component, _React$Component);

  function Component() {
    var _ref4;

    _classCallCheck(this, Component);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this4 = _possibleConstructorReturn(this, (_ref4 = Component.__proto__ || Object.getPrototypeOf(Component)).call.apply(_ref4, [this].concat(args)));

    _this4.state = {};
    _this4.createFields(_this4.constructor.stateFields || {});
    return _this4;
  }

  _createClass(Component, [{
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this._fields[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var field = _step2.value;

          field.deactivate();
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2['return']) {
            _iterator2['return']();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }, {
    key: 'createFields',
    value: function createFields(specs) {
      this._fields = new Set();

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = Object.keys(specs)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var name = _step3.value;

          var spec = specs[name];
          var field = StateField.create({ name: name, spec: spec, component: this });

          field.initialize();
          field.activate();

          this._fields.add(field);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3['return']) {
            _iterator3['return']();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
  }]);

  return Component;
}(React.Component);

module.exports = { Component: Component, StateField: StateField, QuerySetStateField: QuerySetStateField, count: count };
},{}]},{},[1])(1)
});