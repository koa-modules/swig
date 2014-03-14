
'use strict';

/**
 *  Module dependences.
 */

var debug = require('debug')('koa:swig');
var path = require('path');
var swig = require('swig');
var fs = require('co-fs-plus');
var extname = path.extname;
var join = path.join;

/**
 *  Expose `swigRender`.
 */

module.exports = swigRender;

/**
 *  Default render options.
 */

var _settings = {
  autoescape: true,
  cache: 'memory',
  ext:  'html',
  filters: {},
  locals: {},
  views: 'views'
};

// Generator `renderFile`

function renderFile(pathName, locals) {
  return function (done) {
    swig.renderFile(pathName, locals, done); 
  };
}

function swigRender(app, settings) {
  if (app.context.render) {
    return;
  }

  app.context.render = render;

  if (!settings) {
    settings = _settings;
  } else {
    merge(settings, _settings);
  }

  var dir = settings.views;

  var cache = settings.cache;
  if (settings.hasOwnProperty('cache') || settings.hasOwnProperty('autoescape')) {
    swig.setDefaults({
      autoescape: settings.autoescape,
      cache: cache
    });
  }

  // swig global filters
  var filters = settings.filters;
  for (var name in filters) {
    swig.setFilter(name, filters[name]);
  }

  function *render(view, options) {
    if (!options) {
      options = {};
    }

    // default extname
    var e = extname(view);

    if (!e) {
      e = '.' + settings.ext;
      view += e;
    }

    // resolve
    view = join(dir, view);

    // cache
    options.cache = cache;

    merge(options, settings.locals);

    debug('render %s %j', view, options);
    var html = yield renderFile(view, options);
    this.type = 'html';
    this.length = html.length;
    this.body = html;
  }
}

exports.swig = swig;

function merge(target, source) {
  for (var prop in source) {
    if (prop in target) {
      continue;
    }
    target[prop] = source[prop];
  }
}
