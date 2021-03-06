const request = require('supertest');
const test = require('ava');
const express = require('express');
const queryString = require('query-string');

const pathFn = process.env.FILENAME ? process.env.FILENAME : '../lib/index';
const lib = require(pathFn);
const fakeData = require('./mock/fakeRouteConfig');

const app = express();

function routeSuccess(req, res) {
  return res.status(200).json({ status: 200 });
}

function middleware() {
  const parseRouteDataOps = {
    envIsDev: 'development',
  };

  return lib(fakeData, null, parseRouteDataOps);
};

/**
 * Express logic
 */
app.set('query parser', 'simple');
app.use(express.json());

/**
 * GET
 */
app.get('/api/verify/objectid', middleware(), routeSuccess);
app.get('/api/room/:uuid', [middleware()], routeSuccess);
app.get('/api/test/:kuid', [middleware()], routeSuccess);
app.get('/:test', middleware(), routeSuccess);
app.get("/api/:test/route/:secondTest", middleware(), routeSuccess);
app.get('/t/donotexist', middleware(), routeSuccess);

/**
 * POST
 */
app.post('/api/room/:uuid/account', middleware(), routeSuccess);
app.post('/api/array/with/subschema', middleware(), routeSuccess);
app.post('/operation', middleware(), routeSuccess);
app.post('/adddate', middleware(), routeSuccess);

/**
 * PUT
 */
app.put('/post', middleware(), routeSuccess);

/**
 * PATCH
 */
app.patch('/user/:userId', middleware(), routeSuccess);

/**
 * Delete
 */
app.delete('/api/deletewithparamsarray', middleware(), routeSuccess);

/**
 * Run tests
 */
test('route with dynamic params', async function (t) {
  const response = await request(app)
    .get("/api/paramsDynamic/route/secondParamsDynamic")
    .query(queryString.stringify(
      {
        filter: 'lol',
        test: [true, false, 'true'],
        objTest: { strict: true, params: { test: { type: String, required: true } } },
      }, { arrayFormat: 'comma' }))

  t.pass(response.status, 200, response.body.message);
});

test('GET with query', async function (t) {
  const res = await request(app)
    .get('/api/room/11-sdf-ghk-lkj')
    .query({ createSession: true })

  t.pass(res.status, 200, res.body.message);
});

test('GET with query two', async function (t) {
  const r = await request(app)
    .get('/api/test/123SDQDFF')
    .query({ keywords: "fo-foo-fooo-foooo"})

  t.pass(r.status, 200, r.body.message);
})

test('POST with string canBe and match field', async function (t) {
  const r = await request(app)
    .post('/api/room/AZRERTERY/account')
    .send({ theme: '007bff', roomId: 'f03f70fc-98aa-4968-a70a-61387d96b1e2'})


    t.pass(r.status, 200, r.body.message);
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

  t.is(r.status, 200, r.body.message);
});

test('ObjectId with GET', async function (t) {
  const r = await request(app)
  .get('/api/verify/objectid')
  .query({ kuid: '61e95434f307970020bfa64b'})

  t.is(r.status, 200, r.body.message);
});

test('GET with dynamic params', async function (t) {
  const r = await request(app)
  .get('/test')

  t.is(r.status, 200, r.body.message);
});

test('bad routes static', async function (t) {
  const r = await request(app)
  .get('/t/donotexist')

  t.is(r.status, 500, r.body.message);
});

test('POST with field with many types', async function (t) {
  const r = await request(app)
  .post('/operation')
    .send({ to: '623e447304bad230d436a52c', from: 'foo', amount: 20, info: 'foo-foo' })

  t.is(r.status, 200, r.body.message);
});

test('DELETE with queryparams as array', async function(t) {
  const r = await request(app)
    .delete('/api/deletewithparamsarray?array=624d9fdabe39351e2c49f2ac,624d9f33917a20db0390d390');
  
  t.is(r.status, 200, r.body.message);
});

test('PATCH with dynamic params', async function(t){
  const r = await request(app)
    .patch('/user/624d9fdabe39351e2c49f2ac')
    .send({ new: false });
  
  t.is(r.status, 200, r.body.message);
})

test('POST test route with date', async function(t) {
  const r = await request(app)
    .post('/adddate')
    .send({ createdAt: new Date()})
  
  t.is(r.status, 200, r.body.message);
});