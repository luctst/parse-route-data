<div align="center">
  <br>
  <br>
  <p>
    <b>parse-route-data</b>
  </p>
  <p>
     <i>Express middleware, intercept req data object and return only what you need</i>
  </p>
  <p>

[![Build Status](https://travis-ci.com/luctst/parse-route-data.svg?branch=master)](https://travis-ci.com/luctst/parse-route-data)
[![NPM version](https://img.shields.io/npm/v/parse-route-data?style=flat-square)](https://img.shields.io/npm/v/parse-route-data?style=flat-square)
[![Package size](https://img.shields.io/bundlephobia/min/parse-route-data)](https://img.shields.io/bundlephobia/min/parse-route-data)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
  </p>
</div>

## Why 🤔
---
This package is an express middleware who perform some actions on `req.query` or `req.body` object and allow you to define what you really want in a specific route by creating a config files filled with your API routes.

Concretely using a config file with route schemas we retrieve the data sent from the client either from `req.query` or `req.body` then we compare this data with your configuration file and if they do not match the program returns an error or he keeps running.

## Install 🐙
---
```bash
$ npm i parse-route-data
```

## Usage 💡
---

First you need to create a config `object`, create a file and export an object from this file, there are a couple of rules in order to correctly create the config `object`.

### First level key
The first level of your config object should only include HTTP methods see the list below and their values should be `object`

* [HTTP verbs](https://developer.mozilla.org/fr/docs/Web/HTTP/Methods)

### Second level key
Inside your http method object you can write your API routes, the value keys must be string and their values `object`, let's say your API has three routes (two statics, one with dynamic params) one with the GET method, one with POST and finally one with DELETE, you can write those routes like this:

* GET, `/api/user`,
* POST `/api/session/user`,
* DELETE `/api/:user`

> **Note** - Do not forget to start all your routes with `/`, you may notice that to use dynamic data in your route you can use `:` there is nothing fancy here this is Express logic.

### Third level key
At this level you can define which data your route should received, 

inside the route object start creating your schema a route schema is simply an object with some keys which are `object` and contains some schemaType

| SchemaType | Constructor | Values   | Description  |
| ------     | ----------- | -------  | ---          |
| type*      | All         | Mixed    | Type define which data your field must be |
| required   | All         | Boolean  | Is this field must be include in your data|
| default    | All         | Mixed    | Define which value your field should be if not created|
| maxLength  | Array, String| Number  | Which length your field must have|
| itemsType  | Array       | Mixed    | Which data your inner items must be|
| itemsSchema| Array, Object| Object  | Object with SchemaType|
| match      | String       | RegExp  | Should match the regExp expression|
| canBe      | String       | Array   | Array of strings your field should match, at least one item|
| min        | Number       | Number  | Value is less or equal|
| max        | Number       | Number  | Value is greater or equal|
| notBefore  | Date         | Date    | Must be before date specified|
| strict     | Object       | Boolean | Must have the exact same length|

## Real case exemple
```js
// ./dev/foo/config.js
module.exports = {
  get: {
    '/api/foo': null,
    "/api/:foo/route/:foofoo": {
      filter: {
          type: String,
          required: true,
      },
      test: {
          type: Array,
          itemsType: [String, Boolean],
          required: true,
      },
    }
  },
  post: {
    '/api/user': {
      name: {
        type: String,
        required: true,
        maxLength: 10,
      }
    }
  },
  delete: {
    '/api/user/:id': null,
  }
}
```

```js
// ./dev/foo/routes/routeApi.js
const configRoutes = require('../config.js');
const parseRouteData = require('parse-route-data');

function greatSuccess (res, res) {
  return res.status(200).json({ success: true });
}

// 200
app.get('/api/:foo', parseRouteData(configRoutes), greatSuccess);

// req.query = {},
// Error, require req.query = { filter: 'good', test: ['good', false]};
app.get('/api/:foo/route/:foofoo', parseRouteData(configRoutes), greateSuccess);

// 200
app.get('/api/:foo/route/:foofoo?filter=good&test=['good', false]', parseRouteData(configRoutes), greateSuccess);

// req.body = {};
// Error, require req.body = { name: 'no name'}
app.post('/api/user', parseRouteData(configRoutes), greateSuccess);

// req.body = { name: 'this is a very long name'};
//Error, require name less than 10 characters.
app.post('/api/user', parseRouteData(configRoutes), greateSuccess);

// req.body = { name: 'Pennywise'};
// 200
app.post('/api/user', parseRouteData(configRoutes), greateSuccess);

// other routes..
```

### Common fields
> **Note** - mixed data can be string, array, objectId, number, boolean, date, regExp type.

**type**

{} constructor - *required*

Type define which data your field must be, can be a `String`, `Array`, `ObjectId`, `Number`, `Boolean`, `Date` constructor.

## API
---
### parseRouteData(config, [responseFn, options])

**config**

Type: `object` - *required*

The config object with routes schema types.

---

**responseFn**

Type: `function` - *optional*

Function who takes `req`, `res`, `next` arguments and must return response to the client.

---

**options**

Type: `object` - *optional*

#### errorServerCode

Type: `number`

Default: `500`

The error code to return when server error.

#### errorRouteDataCode

Type: `number`

Default: `400`

The error code to return when error with route. 

#### envIsDev

Type: `string`

Default: `production`

Either the package is runnning in dev or production mode.

---

## Contributing 🍰
Please make sure to read the [Contributing Guide]() before making a pull request.

Thank you to all the people who already contributed to this project!

## Maintainers 👷
List of maintainers, replace all `href`, `src` attributes by your maintainers datas.
<table>
  <tr>
    <td align="center"><a href="https://lucastostee.now.sh/"><img src="https://avatars3.githubusercontent.com/u/22588842?s=460&v=4" width="100px;" alt="Tostee Lucas"/><br /><sub><b>Tostee Lucas</b></sub></a><br /><a href="#" title="Code">💻</a></td>
  </tr>
</table>

## License ⚖️
@MIT

---
<div align="center">
	<b>
		<a href="https://www.npmjs.com/package/get-good-readme">File generated with get-good-readme module</a>
	</b>
</div>
