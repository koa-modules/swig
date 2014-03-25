# koa-swig [![Build Status](https://travis-ci.org/fundon/koa-swig.svg)](https://travis-ci.org/fundon/koa-swig)

[Koa][] view render based on [Swig][], support tags, filters, and extensions.

  [![NPM](https://nodei.co/npm/koa-swig.png?downloads=true)](https://nodei.co/npm/koa-swig/)

### Usage

#### Install

```
npm install koa-swig
```

#### Features

* First, automatically merge `ctx.locals`.
* Second, automatically merge `ctx.flash`.
* Finally, merge custom locals.

#### Example

```js
var koa = require('koa');
var render = require('koa-swig');
var app = koa();

render(app, {
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

#### Settings

* [swig options](http://paularmstrong.github.io/swig/docs/api/#SwigOpts)
  - autoescape
  - cache
  - locals

* filters: swig custom [filters](http://paularmstrong.github.io/swig/docs/extending/#filters)

* tags: swig custom [tags](http://paularmstrong.github.io/swig/docs/extending/#tags)

* extensions: add extensions for custom tags

* ext: default view extname

* root: view root directory


#### Others

* [swig-extras](https://github.com/paularmstrong/swig-extras) A collection of handy tags, filters, and extensions for Swig.

### Licences

MIT

[koa]: http://koajs.com
[swig]: http://paularmstrong.github.io/swig/

