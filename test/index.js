'use strict';

/**
 * Module dependencies.
 */

var request = require('supertest');
var should = require('should');
var render = require('..');
var path = require('path');
var koa = require('koa');

describe('koa-swig', function() {
  describe('render', function() {
    it('should relative dir ok', function(done) {
      var app = koa();
      app.context.render = render({
        root: 'example',
        ext: 'txt',
        filters: {
          format: function(v) {
            return v.toUpperCase();
          }
        }
      });
      app.use(function*() {
        yield this.render('basic', {
          name: 'koa-swig'
        });
      });
      request(app.listen())
        .get('/')
        .expect('KOA-SWIG\n')
        .expect(200, done);
    });

    it('should filters.format ok', function(done) {
      var app = koa();
      app.context.render = render({
        root: path.join(__dirname, '../example'),
        ext: 'txt',
        filters: {
          format: function(v) {
            return v.toUpperCase();
          }
        }
      });
      app.use(function*() {
        yield this.render('basic', {
          name: 'koa-swig'
        });
      });
      request(app.listen())
        .get('/')
        .expect('KOA-SWIG\n')
        .expect(200, done);
    });

    it('should not return response with writeBody = false', function(done) {
      var app = koa();
      app.context.render = render({
        root: path.join(__dirname, '../example'),
        ext: 'txt',
        filters: {
          format: function(v) {
            return v.toUpperCase();
          }
        },
        writeBody: false
      });
      app.use(function*() {
        yield this.render('basic', {
          name: 'koa-swig'
        });
      });
      request(app.listen())
        .get('/')
        .expect('Not Found')
        .expect(404, done);
    });

    it('should return response with writeBody = false and write the body manually', function(done) {
      var app = koa();
      app.context.render = render({
        root: path.join(__dirname, '../example'),
        ext: 'txt',
        filters: {
          format: function(v) {
            return v.toUpperCase();
          }
        },
        writeBody: false
      });
      app.use(function*() {
        var html = yield this.render('basic', {
          name: 'koa-swig'
        });
        this.type = 'html';
        this.body = html;
      });
      request(app.listen())
        .get('/')
        .expect('KOA-SWIG\n')
        .expect(200, done);
    });

    it('should not overwrite context.render', function(done) {
      var app = koa();
      Object.defineProperty(app.context, 'render', {
        value: function() {
          return 'not swig';
        }
      });
      try {
        app.context.render = function() {};
      } catch (e) {}
      app.use(function*() {
        this.body = this.render();
      });
      request(app.listen())
        .get('/')
        .expect('not swig')
        .expect(200, done);
    });

  });

  describe('server', function() {
    var app = require('../example/app');
    it('should render page ok', function(done) {
      request(app)
        .get('/')
        .expect('content-type', 'text/html; charset=utf-8')
        .expect('content-length', '186')
        .expect(/<title>koa-swig.*<\/title>/)
        .expect(200, done);
    });
  });

  describe('tags', function() {
    var headerTag = require('../example/header-tag');
    var app = koa();
    app.context.render = render({
      root: path.join(__dirname, '../example'),
      ext: 'html',
      tags: {
        header: headerTag
      }
    });
    app.use(function*() {
      yield this.render('header');
    });
    it('should add tag ok', function(done) {
      request(app.listen())
        .get('/')
        .expect(200, done);
    });
  });

  describe('extensions', function() {
    var app = koa();
    app.context.render = render({
      root: path.join(__dirname, '../example'),
      tags: {
        now: {
          compile: function() {
            return '_output += _ext.now();';
          },
          parse: function() {
            return true;
          }
        }
      },
      extensions: {
        now: function() {
          return Date.now();
        }
      }
    });
    app.use(function*() {
      yield this.render('now');
    });
    it('should success', function(done) {
      request(app.listen())
        .get('/')
        .expect(200)
        .end(function(err, res) {
          should.not.exist(err);
          parseInt(res.text).should.above(0);
          done();
        });
    });
  });

  describe('flash', function() {
    var app = koa();
    var session = require('koa-session');
    var flash = require('koa-flash');
    app.keys = ['foo'];
    app.use(session(app));
    app.use(flash({
      key: 'bar'
    }));
    app.context.render = render({
      root: path.join(__dirname, '../example')
    });
    app.use(function*() {
      this.flash.notice = 'Success!';
      yield this.render('flash');
    });
    it('should success', function(done) {
      request(app.listen())
        .get('/')
        .expect(/Success/)
        .expect(200, done);
    });
  });

  describe('locals', function() {
    var app = koa();
    var locals = require('koa-locals');

    locals(app, {hasLocals:true});
    app.context.render = render({
      root: path.join(__dirname, '../example')
    });
    app.use(function*() {
      this.locals.hasLocals = true;
      yield this.render('locals');
    });
    it('should success', function(done) {
      request(app.listen())
        .get('/')
        .expect(/Request has locals/)
        .expect(200, done);
    });
  });  

  describe('koa state', function() {
    var app = koa();
    app.context.render = render({
      root: path.join(__dirname, '../example'),
      ext: 'txt',
      filters: {
        format: function(v) {
          return v.toUpperCase();
        }
      }
    });
    app.use(function*() {
      this.state = {
        name: 'koa-swig'
      };
      yield this.render('basic.txt');
    });
    it('should success', function(done) {
      request(app.listen())
        .get('/')
        .expect('KOA-SWIG\n')
        .expect(200, done);
    });
  });

  describe('variable control', function() {
    it('should success', function(done) {
      var app = koa();
      app.context.render = render({
        root: path.join(__dirname, '../example'),
        ext: 'html',
        varControls: ['<%=', '%>']
      });

      app.use(function*() {
        yield this.render('var-control', {
          variable: 'pass'
        });
      });
      request(app.listen())
        .get('/')
        .expect(/pass/)
        .expect(200, done);
    });

    after(function() {
      var app = koa();
      app.context.render = render({
        varControls: ['{{', '}}']
      });
    });
  });

  describe('expose swig', function() {
    var swig = render.swig;
    it('swig should be exposed', function() {
      should.exist(swig.version);
    });
  });


});
