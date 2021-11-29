<div align="center">
  <br>
  <br>
  <p>
    <b>parse-route-data</b>
  </p>
  <p>
     <i>Intercept req data object and return only what you need</i>
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
In this section you can write some popular examples about how you can interact with the project. It's advisable to write some code here.

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
