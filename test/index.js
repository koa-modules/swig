'use strict';

/**
 * Module dependencies.
 */

var request = require('supertest');
var should = require('should');
var render = require('..');
var path = require('path');
var Koa = require('koa');
var mocha=require('mocha');

describe('koa-swig', function() {
    describe('render', function() {
        it('should relative dir ok', function(done) {
            var app = new Koa();
            app.context.render = render({
                root: 'example',
                ext: 'txt',
                filters: {
                    format: function(v) {
                        return v.toUpperCase();
                    }
                }
            });
            app.use(async ctx => {
                await ctx.render('basic', {
                    name: 'koa-swig'
                });
            });
            request(app.listen())
                .get('/')
                .expect('KOA-SWIG\n')
                .expect(200, done);
        });

        it('should filters.format ok', function(done) {
            var app = new Koa();
            app.context.render = render({
                root: path.join(__dirname, '../example'),
                ext: 'txt',
                filters: {
                    format: function(v) {
                        return v.toUpperCase();
                    }
                }
            });
            app.use(async ctx => {
                await ctx.render('basic', {
                    name: 'koa-swig'
                });
            });
            request(app.listen())
                .get('/')
                .expect('KOA-SWIG\n')
                .expect(200, done);
        });

        it('should not return response with writeBody = false', function(done) {
            var app = new Koa();
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
            app.use(async ctx => {
                await ctx.render('basic', {
                    name: 'koa-swig'
                });
            });
            request(app.listen())
                .get('/')
                .expect('Not Found')
                .expect(404, done);
        });

        it('should return response with writeBody = false and write the body manually', function(done) {
            var app = new Koa();
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
            app.use(async ctx => {
                var html = await ctx.render('basic', {
                    name: 'koa-swig'
                });
                ctx.type = 'html';
                ctx.body = html;
            });
            request(app.listen())
                .get('/')
                .expect('KOA-SWIG\n')
                .expect(200, done);
        });

        it('should not overwrite context.render', function(done) {
            var app = new Koa();
            Object.defineProperty(app.context, 'render', {
                value: function() {
                    return 'not swig';
                }
            });
            try {
                app.context.render = function() {};
            } catch (e) {}
            app.use(async ctx => {
                ctx.body = ctx.render();
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
        var app = new Koa();
        app.context.render = render({
            root: path.join(__dirname, '../example'),
            ext: 'html',
            tags: {
                header: headerTag
            }
        });
        app.use(async ctx => {
            await ctx.render('header');
        });
        it('should add tag ok', function(done) {
            request(app.listen())
                .get('/')
                .expect(200, done);
        });
    });

    describe('extensions', function() {
        var app = new Koa();
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
        app.use(async ctx => {
            await ctx.render('now');
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
        var app = new Koa();
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
        app.use(async ctx => {
            ctx.flash.notice= 'Success!';
            await ctx.render('flash');
        });
        it('should success', function(done) {
            request(app.listen())
                .get('/')
                .expect(/Success/)
                .expect(200, done);
        });
    });

    describe('koa state', function() {
        var app = new Koa();
        app.context.render = render({
            root: path.join(__dirname, '../example'),
            ext: 'txt',
            filters: {
                format: function(v) {
                    return v.toUpperCase();
                }
            }
        });
        app.use(async ctx => {
            ctx.state = {
                name: 'koa-swig'
            };
            await ctx.render('basic.txt');
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
            var app = new Koa();
            app.context.render = render({
                root: path.join(__dirname, '../example'),
                ext: 'html',
                varControls: ['<%=', '%>']
            });

            app.use(async ctx => {
                await ctx.render('var-control', {
                    variable: 'pass'
                });
            });
            request(app.listen())
                .get('/')
                .expect(/pass/)
                .expect(200, done);
        });

        after(function() {
            var app = new Koa();
            app.context.render = render({
                varControls: ['{{', '}}']
            });
        });
    });

    describe('Tag control', function() {
        it('should success', function(done) {
            var app = new Koa();
            app.context.render = render({
                root: path.join(__dirname, '../example'),
                ext: 'html',
                tagControls: ['<%', '%>']
            });

            app.use(async ctx => {
                await ctx.render('tag-control', {
                    arr: [1, 2, 3]
                });
            });

            request(app.listen())
                .get('/')
                .expect(/123/)
                .expect(200, done);

            after(function() {
                var app = new Koa();
                app.context.render = render({
                    tagControls: ['{%', '%}']
                });
            });
        });
    });

    describe('Comment control', function() {
        it('should success', function(done) {
            var app = new Koa();
            app.context.render = render({
                root: path.join(__dirname, '../example'),
                ext: 'html',
                cmtControls: ['<#', '#>']
            });
            app.use(async ctx => {
                await ctx.render('cmt-control', {
                    variable: 'pass'
                });
            });
            request(app.listen())
                .get('/')
                .expect(/pass/)
                .expect(200, done);

            after(function() {
                var app = new Koa();
                app.context.render = render({
                    cmtControls: ['{#', '#}']
                });
            });
        });
    });

    describe('expose swig', function() {
        var swig = render.swig;
        it('swig should be exposed', function() {
            should.exist(swig.version);
        });
    });

    describe('test setLocals', function() {
        var swig = render.swig
    })

    describe('test setLocals', function() {
        it('should success', function(done) {
            var app = new Koa();
            app.context.render = render({
                root: path.join(__dirname, '../example'),
                ext: 'html'
            });
            render.swig.setLocals({
                'local': 'hello world'
            })
            app.use(async ctx => {
                await ctx.render('locals-test');
            });
            request(app.listen())
                .get('/')
                .expect(/hello world/)
                .expect(200, done);
        })
    })

    describe('test getLocals', function() {
        it('should success', function() {
            var app = new Koa();
            app.context.render = render({
                root: path.join(__dirname, '../example'),
                ext: 'html',
                locals: {
                    'local': 'hello world'
                }
            });
            render.swig.getLocals('local').should.equal('hello world');
        })
    })
});