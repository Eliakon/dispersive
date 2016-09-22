require("babel-core/register");
require("babel-polyfill");

var Action = require('./es5/lib/action');

exports.Model = require('./es5/lib/model');
exports.ObjectManager = require('./es5/lib/manager');
exports.createAction = Action.create;
exports.Dispatcher = require('./es5/lib/dispatcher');