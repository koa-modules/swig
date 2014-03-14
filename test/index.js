'use strict';

/**
 * Module dependencies.
 */

var render = require('..');
var path = require('path');
var request = require('supertest');
var koa = require('koa');

describe('koa-swig', function () {
  describe('render', function () {
    var app = koa();
    it('should filters.format ok', function (done) {
      render(app, {
        views: path.join(__dirname, '../example'),
	ext: 'txt',
        filters: {
          format: function (v) { return v.toUpperCase(); }
        }
      });
      app.context.render.should.be.Function;
      app.use(function *() {
	yield this.render('basic', {
	  name: 'koa-swig'
	})
      });
      request(app.listen())
	.get('/')
	.expect('KOA-SWIG\n')
	.expect(200, done);
    });
  });

  describe('server', function () {
    var app = require('../example/app');
    it('should render page ok', function (done) {
      request(app)
      .get('/')
      .expect('content-type', 'text/html; charset=utf-8')
      .expect(/<title>koa-swig@v0.0.\d<\/title>/)
      .expect(200, done);
    });
  });
});
