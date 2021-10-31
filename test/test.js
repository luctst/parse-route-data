const request = require('supertest');
const test = require('ava');
const express = require('express');

const lib = require('../lib/index');

const app = express();
/**
 * Express logic
 */
app.use(express.json());
app.use(lib({ get: true}))

app.get('/', function (res, res) {
    res.status(200).json({ status: 200 });
})

test('Test', async function (t) {
    const response = await request(app)
    .get('/');

    t.log(response.body);
    t.pass();
});