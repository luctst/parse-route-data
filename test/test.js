const request = require('supertest');
const test = require('ava');
const express = require('express');
const queryString = require('query-string');

const lib = require('../lib/index');
const fakeData = require('./mock/fakeRouteConfig');

const app = express();
/**
 * Express logic
 */
app.set('query parser', 'simple');
app.use(express.json());

app.get('/api/room/:uuid', [lib(fakeData)], function (req, res) {
  res.status(200).json({ status: 200 });
})

app.get('/:test', lib(fakeData), function (req, res) {
  res.status(200).json({ status: 200 });
})

app.get("/api/:test/route/:secondTest", lib(fakeData), function (req, res) {
  res.status(200).json({ status: 200 });
})

app.put('/post', lib(fakeData), function (req, res) {
  res.status(200).json({ status: 200 });
})

app.post('/api/room/:uuid/account', lib(fakeData), function (req, res) {
  res.status(200).json({ status: 200 });
});

test('Test', async function (t) {
  const response = await request(app)
    .get("/api/paramsDynamic/route/secondParamsDynamic")
    .query(queryString.stringify(
      {
        filter: 'lol',
        test: [true, false, 'true'],
        objTest: { strict: true, params: { test: { type: String, required: true } } },
      }, { arrayFormat: 'comma' }));
  t.pass();
});

test('GET with query', async function (t) {
  const res = await request(app)
    .get('/api/room/:uuid')
    .query({ createSession: true })
    .expect(200);
  t.pass();
});

test('POST with string canBe field', async function (t) {
  const r = await request(app)
    .post('/api/room/:uuid/account')
    .send({ theme: '007bff'})
    .expect(200);

    t.log(r.body);

    t.pass();
});