
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
 *  Default render settings.
 */

var defaultSettings = {
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

  var sets = Object.create(null);
  // merge default settings
  mixin(sets, defaultSettings);

  // merge settings
  if (settings) {
    mixin(sets, settings)
  }
  settings = sets;

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
    var opts = Object.create(null);

    // default extname
    var e = extname(view);

    if (!e) {
      e = '.' + settings.ext;
      view += e;
    }

    // resolve
    view = join(root, view);

    // merge ctx.locals, for `koa-locals`
    mixin(opts, this.locals || Object.create(null));

    // merge settings.locals
    mixin(opts, settings.locals)

    options = options || Object.create(null);
    // cache
    options.cache = cache;

    // merge options
    mixin(opts, options);

    debug('render %s %j', view, opts);
    var html = yield renderFile(view, opts);
    this.type = 'html';
    this.length = html.length;
    this.body = html;
  }
}

exports.swig = swig;

/**
 *  Add filters for Swig
 */

function setFilters(swig, filters) {
  for (var name in filters) {
    swig.setFilter(name, filters[name]);
  }
}

/**
 *  Add tags for Swig
 */

function setTags(swig, tags) {
  var name, tag;
  for (name in tags) {
    tag = tags[name];
    swig.setTag(name, tag.parse, tag.compile, tag.ends, tag.blockLevel);
  }
}

/**
 *  Add extensions for Swig
 */

function setExtensions(swig, extensions) {
  for (var name in extensions) {
    swig.setExtension(name, extensions[name]);
  }
}

/**
 *  Merge object b with object a.
 */

function mixin(a, b) {
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
};
