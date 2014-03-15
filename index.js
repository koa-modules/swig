
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
  root: 'views',
  cache: 'memory',
  ext:  'html',
  locals: Object.create(null),
  filters: Object.create(null),
  tags: Object.create(null),
  extensions: Object.create(null)
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

  var root = settings.root;

  var cache = settings.cache;
  swig.setDefaults({
    cache: cache,
    autoescape: settings.autoescape,
    locals: settings.locals
  });

  // swig custom filters
  setFilters(swig, settings.filters);

  // swig custom tags
  setTags(swig, settings.tags);

  // add extensions for custom tags
  setExtensions(swig, settings.extensions);

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
    view = join(root, view);

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

function setFilters(swig, filters) {
  var name;
  for (name in filters) {
    swig.setFilter(name, filters[name]);
  }
}

function setTags(swig, tags) {
  var name, tag;
  for (name in tags) {
    tag = tags[name];
    swig.setTag(name, tag.parse, tag.compile, tag.ends, tags.blockLevel);
  }
}

function setExtensions(swig, extensions) {
  var name;
  for (name in extensions) {
    swig.setExtension(name, extensions[name]);
  }
}

function merge(target, source) {
  for (var prop in source) {
    if (prop in target) {
      continue;
    }
    target[prop] = source[prop];
  }
}
