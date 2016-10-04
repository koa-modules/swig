# koa-swig

[![NPM version][npm-img]][npm-url]
[![Build status][travis-img]][travis-url]
[![Test coverage][coveralls-img]][coveralls-url]
[![License][license-img]][license-url]
[![Dependency status][david-img]][david-url]

[Koa][] view render based on [Swig][], support tags, filters, and extensions.

[![NPM](https://nodei.co/npm/koa-swig.png?downloads=true)](https://nodei.co/npm/koa-swig/)

### Usage

* **v2.x**

    ```js
    app.context.render = render(settings);
    ```

* **v1.x**

    ```js
    render(app, settings);
    ```

#### Install

```
npm install koa-swig
```

#### Features

* First, automatically merge `ctx.state` from koa 0.14.
* Second, automatically merge `ctx.flash`.
* Finally, merge custom locals.

#### Example

```js
var koa = require('koa');
var render = require('koa-swig');
var app = koa();

app.context.render = render({
  root: path.join(__dirname, 'views'),
  autoescape: true,
  cache: 'memory', // disable, set to false
  ext: 'html',
  locals: locals,
  filters: filters,
  tags: tags,
  extensions: extensions
});

app.use(function *() {
  yield this.render('index');
});

app.listen(2333);
```

```js
// koa v2.x
var co = require('co');

app.context.render = co.wrap(render({
  // ...your setting
  writeBody: false
}));

app.use(async ctx => ctx.body = await ctx.render('index'));
```

#### Settings

* [swig options](http://paularmstrong.github.io/swig/docs/api/#SwigOpts)
  - autoescape
  - cache
  - locals
  - varControls
  - tagControls
  - cmtControls

* filters: swig custom [filters](http://paularmstrong.github.io/swig/docs/extending/#filters)

* tags: swig custom [tags](http://paularmstrong.github.io/swig/docs/extending/#tags)

* extensions: add extensions for custom tags

* ext: default view extname

* root: view root directory

* writeBody: default(true) auto write body and response

#### Methods

* render.swig.setLocals

* render.swig.getLocals


#### Others

* [swig-extras](https://github.com/paularmstrong/swig-extras) A collection of handy tags, filters, and extensions for Swig.

### Licences

MIT

[koa]: http://koajs.com
[swig]: http://paularmstrong.github.io/swig/

[npm-img]: https://img.shields.io/npm/v/koa-swig.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koa-swig
[travis-img]: https://img.shields.io/travis/koa-modules/swig.svg?style=flat-square
[travis-url]: https://travis-ci.org/koa-modules/swig
[coveralls-img]: https://img.shields.io/coveralls/koa-modules/swig.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/koa-modules/swig?branch=master
[license-img]: https://img.shields.io/badge/license-MIT-green.svg?style=flat-square
[license-url]: LICENSE
[david-img]: https://img.shields.io/david/koa-modules/swig.svg?style=flat-square
[david-url]: https://david-dm.org/koa-modules/swig
