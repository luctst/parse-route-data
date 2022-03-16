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

app.get('/api/verify/objectid', lib(fakeData), function (req, res) {
  res.status(200).json({ status: 200 });
})

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

app.post('/api/array/with/subschema', lib(fakeData), function (req, res) {
  res.status(200).json({ status: 200 });
})

test('route with dynamic params', async function (t) {
  const response = await request(app)
    .get("/api/paramsDynamic/route/secondParamsDynamic")
    .query(queryString.stringify(
      {
        filter: 'lol',
        test: [true, false, 'true'],
        objTest: { strict: true, params: { test: { type: String, required: true } } },
      }, { arrayFormat: 'comma' }))
    .expect(200);
  t.pass();
});

test('GET with query', async function (t) {
  const res = await request(app)
    .get('/api/room/:uuid')
    .query({ createSession: true })
    .expect(200);
  t.pass();
});

test('POST with string canBe and match field', async function (t) {
  const r = await request(app)
    .post('/api/room/:uuid/account')
    .send({ theme: '007bff', roomId: 'f03f70fc-98aa-4968-a70a-61387d96b1e2'})
    .expect(200);

    t.pass();
});

test('array with itemSchema', async function (t) {
  const r = await request(app)
  .post('/api/array/with/subschema')
  .send(
    { 
      data: [
        {
          isCredit: true, 
          amount: 230, 
          to: "61e95434f307970020bfa64b", 
          from: "61e95b96f307970020bfa67a", 
          isFieldObjectId: true, 
          info: "test"
        }
      ]
    }
  )
  .expect(200);
  t.pass();
});

test('ObjectId with GET', async function (t) {
  await request(app)
  .get('/api/verify/objectid')
  .query({ oid: '61e95434f307970020bfa64b'})
  .expect(200);
  t.pass();
});