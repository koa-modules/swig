/*!
 * swig
 * Copyright(c) 2015 Fangdun Cai
 * MIT Licensed
 */

'use strict';

/**
 * Module dependences.
 */

const debug = require('debug')('koa:swig');
const mixin = require('utils-merge');
const thenify = require('thenify');
const path = require('path');
const swig = require('swig-templates');
const extname = path.extname;
const resolve = path.resolve;

/**
 * Expose `render`, `swig`.
 */

exports = module.exports = renderer;
exports.swig = swig;

/**
 * Default render settings.
 */

const defaultSettings = {
  autoescape: true,
  root: 'views',
  cache: 'memory',
  ext: 'html',
  writeBody: true
    /*
    locals: {},
    filters: {}.
    tags: {},
    extensions: {}
    */
};

// Generator `renderFile`

const renderFile = thenify(swig.renderFile);

function renderer(settings) {
  // merge default settings
  var sets = Object.create(defaultSettings);

  // merge settings
  if (settings) {
    mixin(sets, settings);
  }
  settings = sets;

  var root = settings.root;
  var locals = settings.locals || {};
  var cache = settings.cache;
  var defaults = {
    autoescape: settings.autoescape,
    cache: cache,
    locals: locals
  };
  if (settings.varControls) {
    defaults.varControls = settings.varControls;
  }
  if (settings.tagControls) {
    defaults.tagControls = settings.tagControls;
  }
  if (settings.cmtControls) {
    defaults.cmtControls = settings.cmtControls;
  }
  swig.setDefaults(defaults);

  // swig custom filters
  setFilters(swig, settings.filters);

  // swig custom tags
  setTags(swig, settings.tags);

  // add extensions for custom tags
  setExtensions(swig, settings.extensions);

  swig.setLocals = setLocals;

  swig.getLocals = getLocals;

  return render;

  function* render(view, options) {
    // default extname
    var e = extname(view);

    if (!e) {
      e = '.' + settings.ext;
      view += e;
    }

    // resolve
    view = resolve(root, view);

    // merge ctx.state
    var opts = this.state || {};

    // merge ctx.flash, for `koa-flash` or `koa-connect-flash`
    mixin(opts, {
      flash: this.flash,
      cache: cache
    });

    // merge settings.locals
    mixin(opts, locals);

    // merge options
    mixin(opts, options || {});

    debug('render %s %j', view, opts);
    var html = yield renderFile(view, opts);
    /* jshint validthis:true */

    if (settings.writeBody === true) {
      this.body = html;
    }

    return html;
  }

  function setLocals(args) {
    mixin(locals,args);
  }

  function getLocals(key) {
    return locals[key];
  }

}

/**
 * Add filters for Swig
 */

function setFilters(swig, filters) {
  for (var name in filters) {
    swig.setFilter(name, filters[name]);
  }
}

/**
 * Add tags for Swig
 */

function setTags(swig, tags) {
  var name, tag;
  for (name in tags) {
    tag = tags[name];
    swig.setTag(name, tag.parse, tag.compile, tag.ends, tag.blockLevel);
  }
}

/**
 * Add extensions for Swig
 */

function setExtensions(swig, extensions) {
  for (var name in extensions) {
    swig.setExtension(name, extensions[name]);
  }


}
