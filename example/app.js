'use strict';

/**
 * Module dependencies.
 */

var koa = require('koa');
var render = require('..');
var path = require('path');
var pkg = require('../package');

var app = koa();

var locals = pkg;

var filters = {
  formatVersion: function (version) {
    return '@v' + version;
  }
};

render(app, {
  root: path.join(__dirname, 'views'),
  ext: 'html',
  locals: locals,
  filters: filters
});

app.use(function *() {
  yield this.render('index', {
    user: {
      name: 'fundon',
      email: 'cfddream@gmail.com'
    }
  });
});

if (process.env.NODE_ENV === 'test') {
  module.exports = app.callback();
} else {
  app.listen(2333);
}
