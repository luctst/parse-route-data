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
[![Dependencies](https://img.shields.io/david/luctst/parse-route-data.svg?style=popout-square)](https://david-dm.org/luctst/parse-route-data)
[![devDependencies Status](https://david-dm.org/luctst/parse-route-data/dev-status.svg?style=flat-square)](https://david-dm.org/luctst/parse-route-data?type=dev)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Twitter](https://img.shields.io/twitter/follow/luctstt.svg?label=Follow&style=social)](https://twitter.com/luctstt)

  </p>
</div>

---

**Content**

* [Install](##install)
* [Usage](##usage)
* [Exemples](##exemples)
* [Contributing](##contributing)
* [Maintainers](##maintainers)

## Install 🐙
`npm i parse-route-data`

## Usage 💡
This package is an express middleware who perform some actions on `req.query` or `req.body` object and allow you to define what you really want in a specific route by creating a config files filled with your API routes see exemples section below.

In order to create your config you must define some route schemas just like mongoose model if you work with it will sound familiar, route schema are object with fields required or not.

### Common fields
> **Note** - mixed data can be string, array, objectId, number, boolean, date, regExp type.

**type**

{} constructor - *required*

Type define which data your field must be, can be a `String`, `Array`, `ObjectId`, `Number`, `Boolean`, `Date` constructor.

---

**default**

Mixed - *optional*

Default field allow to define which value your field should be if not defined in the `req` object.

---

### Data type fields

Array:

**maxLength**

number - *optional*

Define which length your field must have.

---

**itemsType**

mixed - *optional*

Define which data your items array must be.

---

String:

**match**

regExp - *optional*

The string must match the regExp expression.

---

**canBe**

array - *optional*

An array of values the field string can be.

---

**maxLength**

number - *optional*

Define the max length of your string.

---

Number:

**max**

number - *optional*

checks if the value is less than or equal to the given maximum.

---

**min**

number - *optional*

checks if the value is greater than or equal to the given minimum.

---

Date:

**notBefore**

date - *optional*

Must be before date specified.

---

Object:

**params**

object - *optional*

An object with sub schemaType who define which data your object must include.

---

**strict**

boolean - *optional*

Object must have the exact same length.

---
## Exemples 🖍
```js
// config-file.js

module.exports = {
  get: {
    '/:test': null,
    "/api/:test/route/:secondTest": {
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
    '/add/user': {
      name: {
        type: String,
        required: true,
        maxLength: 10,
      }
    }
  }
}
```

```js
const configRoutes = require('./config-file.js');
const parseRouteData = require('parse-route-data');

app.get('/test', parseRouteData(configRoutes), function (res, res) {
  return res.status(200).json({ success: true})
})
```

## API
`const parseRouteData = require('parse-route-data');`

## parseRouteData(config, [responseFn, options])

**config**

object - *required*

The config object with routes schema types.

---

**responseFn**

function - *optional*

Function who takes `req`, `res`, `next` arguments and must return response to the client.

---

**options**

object - *optional*

Optional object who modify the main lib function behavior, can take:

* `errorServerCode` { number }, default: `500` - The error code to return when server error.
* `errorRouteDataCode` { number }, default: `400` - The error code to return when error with route. 
* `envIsDev` { Boolean }, default: `production` - Either the package is runnning in dev or production mode.

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
